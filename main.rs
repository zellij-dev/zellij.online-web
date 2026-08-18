//! keila-altcha — ALTCHA-protected signup relay for a hosted Keila newsletter.
//!
//! Design notes:
//!   * No personal data is ever persisted. IPs are HMAC-hashed with a
//!     daily-rotating secret salt and held only in memory.
//!   * Logs are aggregate counters, never per-request events.
//!   * Every uncertain path fails OPEN. Keila's double opt-in is the safety net,
//!     so a junk address that never confirms is much cheaper than a real
//!     subscriber we turned away.
//!   * Sends to Keila go through a bounded queue drained at a fixed hourly rate,
//!     so a burst is delayed rather than dropped.

use std::collections::{HashMap, HashSet};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use altcha_lib_rs::{create_challenge, verify_json_solution, ChallengeOptions};
use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Json},
    routing::{get, post},
    Form, Router,
};
use base64::Engine;
use hmac::{Hmac, Mac};
use rand::RngCore;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use tokio::sync::mpsc;

// ---------------------------------------------------------------- config

#[derive(Clone)]
struct Config {
    hmac_key: String,
    keila_key: String,
    keila_form_id: String,
    keila_base: String,
    max_number: u64,
    challenge_ttl: i64,
    challenge_per_min: usize,
    submit_per_hour: usize,
    sends_per_hour: usize,
}

fn env_or(key: &str, default: &str) -> String {
    std::env::var(key).unwrap_or_else(|_| default.to_string())
}

fn env_req(key: &str) -> String {
    std::env::var(key).unwrap_or_else(|_| {
        eprintln!("fatal: {key} is not set");
        std::process::exit(1);
    })
}

impl Config {
    fn from_env() -> Self {
        Self {
            hmac_key: env_req("ALTCHA_HMAC_KEY"),
            keila_key: env_req("KEILA_API_KEY"),
            keila_form_id: env_req("KEILA_FORM_ID"),
            keila_base: env_or("KEILA_BASE_URL", "https://app.keila.io"),
            max_number: env_or("ALTCHA_MAX_NUMBER", "50000").parse().unwrap_or(50_000),
            challenge_ttl: env_or("CHALLENGE_TTL_SECS", "600").parse().unwrap_or(600),
            challenge_per_min: env_or("CHALLENGE_PER_MIN", "20").parse().unwrap_or(20),
            submit_per_hour: env_or("SUBMIT_PER_HOUR", "3").parse().unwrap_or(3),
            sends_per_hour: env_or("SENDS_PER_HOUR", "60").parse().unwrap_or(60),
        }
    }
}

// ---------------------------------------------------------------- state

/// Everything here is transient. Losing it on restart costs a few extra
/// attempts, which is an acceptable trade for holding no durable records.
#[derive(Default)]
struct Inner {
    challenge_hits: HashMap<String, Vec<Instant>>,
    submit_hits: HashMap<String, Vec<Instant>>,
    spent: HashSet<String>,
    counters: HashMap<&'static str, u64>,
    ip_salt: Vec<u8>,
    salt_born: Option<Instant>,
}

struct AppState {
    cfg: Config,
    disposable: HashSet<String>,
    tx: mpsc::Sender<String>,
    inner: Mutex<Inner>,
}

type Shared = Arc<AppState>;

impl AppState {
    fn bump(&self, reason: &'static str) {
        let mut g = self.inner.lock().unwrap();
        *g.counters.entry(reason).or_insert(0) += 1;
    }

    /// HMAC the IP with a secret, daily-rotating salt.
    ///
    /// A bare SHA-256 of an IPv4 address is reversible by brute force in
    /// seconds — the keyspace is only 2^32. The secret salt is what makes this
    /// meaningful, and rotating it gives us expiry for free.
    fn hash_ip(&self, ip: &str) -> String {
        let mut g = self.inner.lock().unwrap();
        let stale = g
            .salt_born
            .map(|t| t.elapsed() > Duration::from_secs(86_400))
            .unwrap_or(true);
        if stale {
            let mut s = vec![0u8; 32];
            rand::thread_rng().fill_bytes(&mut s);
            g.ip_salt = s;
            g.salt_born = Some(Instant::now());
            // Old buckets are keyed on a salt that no longer exists.
            g.challenge_hits.clear();
            g.submit_hits.clear();
        }
        let mut mac = <Hmac<Sha256>>::new_from_slice(&g.ip_salt).expect("hmac accepts any key len");
        mac.update(ip.as_bytes());
        let out = mac.finalize().into_bytes();
        base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(&out[..16])
    }
}

fn allow(log: &mut Vec<Instant>, limit: usize, window: Duration) -> bool {
    let now = Instant::now();
    log.retain(|t| now.duration_since(*t) < window);
    if log.len() >= limit {
        return false;
    }
    log.push(now);
    true
}

/// Caddy sets X-Forwarded-For. This service must never be exposed directly —
/// if it is, this header is attacker-controlled and rate limiting is defeated.
fn client_ip(headers: &HeaderMap) -> String {
    headers
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.split(',').next())
        .map(|s| s.trim().to_string())
        .unwrap_or_else(|| "unknown".to_string())
}

// ---------------------------------------------------------------- handlers

async fn challenge(State(st): State<Shared>, headers: HeaderMap) -> impl IntoResponse {
    let ip = st.hash_ip(&client_ip(&headers));
    {
        let mut g = st.inner.lock().unwrap();
        let log = g.challenge_hits.entry(ip).or_default();
        if !allow(log, st.cfg.challenge_per_min, Duration::from_secs(60)) {
            drop(g);
            st.bump("rate_limit_challenge");
            return (StatusCode::TOO_MANY_REQUESTS, "slow down").into_response();
        }
    }

    let expires = chrono::Utc::now() + chrono::TimeDelta::seconds(st.cfg.challenge_ttl);
    match create_challenge(ChallengeOptions {
        hmac_key: &st.cfg.hmac_key,
        max_number: Some(st.cfg.max_number),
        expires: Some(expires),
        ..Default::default()
    }) {
        Ok(c) => Json(c).into_response(),
        Err(e) => {
            eprintln!("challenge generation failed: {e}");
            st.bump("challenge_error");
            (StatusCode::INTERNAL_SERVER_ERROR, "try again").into_response()
        }
    }
}

#[derive(Deserialize)]
struct SubmitForm {
    email: String,
    altcha: String,
}

#[derive(Serialize)]
struct Reply {
    ok: bool,
    message: String,
}

fn reply(code: StatusCode, ok: bool, msg: &str) -> axum::response::Response {
    (
        code,
        Json(Reply {
            ok,
            message: msg.to_string(),
        }),
    )
        .into_response()
}

/// Permissive on purpose. We are not trying to prove the mailbox exists —
/// the confirmation email does that. We only reject what is obviously not
/// an address at all.
fn email_shape_ok(email: &str) -> bool {
    if email.len() < 3 || email.len() > 254 {
        return false;
    }
    let mut parts = email.split('@');
    let (Some(local), Some(domain), None) = (parts.next(), parts.next(), parts.next()) else {
        return false;
    };
    !local.is_empty()
        && domain.contains('.')
        && !domain.starts_with('.')
        && !domain.ends_with('.')
        && !email.contains(char::is_whitespace)
}

async fn subscribe(
    State(st): State<Shared>,
    headers: HeaderMap,
    Form(form): Form<SubmitForm>,
) -> impl IntoResponse {
    let ip = st.hash_ip(&client_ip(&headers));

    {
        let mut g = st.inner.lock().unwrap();
        let log = g.submit_hits.entry(ip).or_default();
        if !allow(log, st.cfg.submit_per_hour, Duration::from_secs(3600)) {
            drop(g);
            st.bump("rate_limit_submit");
            return reply(
                StatusCode::TOO_MANY_REQUESTS,
                false,
                "Too many attempts. Please try again later.",
            );
        }
    }

    // ALTCHA's widget posts base64-encoded JSON.
    let decoded = base64::engine::general_purpose::STANDARD
        .decode(form.altcha.as_bytes())
        .ok()
        .and_then(|b| String::from_utf8(b).ok());

    let Some(payload_json) = decoded else {
        st.bump("captcha_fail");
        return reply(StatusCode::BAD_REQUEST, false, "Verification failed.");
    };

    if verify_json_solution(&payload_json, &st.cfg.hmac_key, true).is_err() {
        st.bump("captcha_fail");
        return reply(StatusCode::BAD_REQUEST, false, "Verification failed.");
    }

    // One-time use. The signature stays cryptographically valid until it
    // expires, so without this the same solved token subscribes any number
    // of addresses.
    if let Some(sig) = serde_json::from_str::<serde_json::Value>(&payload_json)
        .ok()
        .and_then(|v| v.get("signature").and_then(|s| s.as_str()).map(String::from))
    {
        let mut g = st.inner.lock().unwrap();
        if !g.spent.insert(sig) {
            drop(g);
            st.bump("replay");
            return reply(StatusCode::BAD_REQUEST, false, "Verification failed.");
        }
    }

    let email = form.email.trim().to_lowercase();
    if !email_shape_ok(&email) {
        st.bump("bad_email");
        return reply(
            StatusCode::BAD_REQUEST,
            false,
            "That doesn't look like an email address.",
        );
    }

    if let Some(domain) = email.rsplit('@').next() {
        if st.disposable.contains(domain) {
            st.bump("disposable");
            return reply(
                StatusCode::BAD_REQUEST,
                false,
                "Please use a permanent email address.",
            );
        }
    }

    // Hand off to the sender. Full queue means we are far beyond any plausible
    // legitimate burst, so shedding here is correct.
    match st.tx.try_send(email) {
        Ok(_) => {
            st.bump("accepted");
            reply(
                StatusCode::OK,
                true,
                "Almost there — check your inbox to confirm.",
            )
        }
        Err(_) => {
            st.bump("queue_full");
            reply(
                StatusCode::SERVICE_UNAVAILABLE,
                false,
                "We're a bit busy. Please try again in a few minutes.",
            )
        }
    }
}

async fn health() -> &'static str {
    "ok"
}

// ---------------------------------------------------------------- sender

/// Drains the queue, never exceeding SENDS_PER_HOUR.
///
/// This is the control that actually protects deliverability. If someone
/// injects addresses faster than this, they get spread over hours instead of
/// producing a spike of confirmation mail — and the counters make it visible.
async fn sender(st: Shared, mut rx: mpsc::Receiver<String>) {
    let http = reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .build()
        .expect("http client");

    let url = format!(
        "{}/api/v1/forms/{}/actions/submit",
        st.cfg.keila_base.trim_end_matches('/'),
        st.cfg.keila_form_id
    );

    let mut recent: Vec<Instant> = Vec::new();

    while let Some(email) = rx.recv().await {
        loop {
            let now = Instant::now();
            recent.retain(|t| now.duration_since(*t) < Duration::from_secs(3600));
            if recent.len() < st.cfg.sends_per_hour {
                break;
            }
            let oldest = recent[0];
            let wait = Duration::from_secs(3600).saturating_sub(now.duration_since(oldest));
            st.bump("send_throttled");
            tokio::time::sleep(wait.max(Duration::from_secs(1))).await;
        }
        recent.push(Instant::now());

        let body = serde_json::json!({ "data": { "email": email } });
        match http
            .post(&url)
            .bearer_auth(&st.cfg.keila_key)
            .json(&body)
            .send()
            .await
        {
            Ok(r) if r.status().is_success() => st.bump("keila_ok"),
            Ok(r) => {
                // Status only — the body may echo the address back.
                eprintln!("keila rejected submission: HTTP {}", r.status());
                st.bump("keila_rejected");
            }
            Err(e) => {
                eprintln!("keila request failed: {}", e.without_url());
                st.bump("keila_error");
            }
        }
    }
}

// ---------------------------------------------------------------- reporting

/// Hourly aggregate line. Counts only — no addresses, no IPs, no per-event rows.
/// This is the visibility that stops silent rejection from costing you a year
/// of growth.
async fn reporter(st: Shared) {
    let mut tick = tokio::time::interval(Duration::from_secs(3600));
    tick.tick().await;
    loop {
        tick.tick().await;
        let snapshot = {
            let mut g = st.inner.lock().unwrap();
            let now = Instant::now();
            g.spent.clear();
            g.challenge_hits
                .retain(|_, v| v.iter().any(|t| now.duration_since(*t) < Duration::from_secs(60)));
            g.submit_hits
                .retain(|_, v| v.iter().any(|t| now.duration_since(*t) < Duration::from_secs(3600)));
            std::mem::take(&mut g.counters)
        };
        if snapshot.is_empty() {
            continue;
        }
        let mut pairs: Vec<_> = snapshot.iter().collect();
        pairs.sort();
        let line = pairs
            .iter()
            .map(|(k, v)| format!("{k}={v}"))
            .collect::<Vec<_>>()
            .join(" ");
        println!("[{}] hourly {}", chrono::Utc::now().to_rfc3339(), line);
    }
}

// ---------------------------------------------------------------- main

fn load_disposable(path: &str) -> HashSet<String> {
    match std::fs::read_to_string(path) {
        Ok(s) => s
            .lines()
            .map(|l| l.trim().to_lowercase())
            .filter(|l| !l.is_empty() && !l.starts_with('#'))
            .collect(),
        Err(_) => {
            eprintln!("note: no disposable-domain list at {path}, continuing without one");
            HashSet::new()
        }
    }
}

#[tokio::main]
async fn main() {
    let cfg = Config::from_env();
    let bind = env_or("BIND_ADDR", "127.0.0.1:3000");
    let disposable = load_disposable(&env_or("DISPOSABLE_LIST", "disposable.txt"));

    let (tx, rx) = mpsc::channel::<String>(1000);

    let st: Shared = Arc::new(AppState {
        cfg,
        disposable,
        tx,
        inner: Mutex::new(Inner::default()),
    });

    tokio::spawn(sender(st.clone(), rx));
    tokio::spawn(reporter(st.clone()));

    let app = Router::new()
        .route("/api/challenge", get(challenge))
        .route("/api/subscribe", post(subscribe))
        .route("/api/health", get(health))
        .with_state(st);

    let listener = tokio::net::TcpListener::bind(&bind)
        .await
        .unwrap_or_else(|e| {
            eprintln!("fatal: cannot bind {bind}: {e}");
            std::process::exit(1);
        });

    println!("listening on {bind}");

    axum::serve(listener, app)
        .with_graceful_shutdown(async {
            let _ = tokio::signal::ctrl_c().await;
        })
        .await
        .expect("server error");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_normal_and_aliased_addresses() {
        assert!(email_shape_ok("jane@example.com"));
        // Aliasing services are what privacy-minded readers use. Never reject these.
        assert!(email_shape_ok("abc.def@simplelogin.com"));
        assert!(email_shape_ok("x+tag@fastmail.com"));
    }

    #[test]
    fn rejects_obvious_nonsense() {
        assert!(!email_shape_ok("nope"));
        assert!(!email_shape_ok("a@b"));
        assert!(!email_shape_ok("a@@b.com"));
        assert!(!email_shape_ok("a b@c.com"));
    }

    #[test]
    fn rate_limit_window_slides() {
        let mut log = Vec::new();
        assert!(allow(&mut log, 2, Duration::from_secs(60)));
        assert!(allow(&mut log, 2, Duration::from_secs(60)));
        assert!(!allow(&mut log, 2, Duration::from_secs(60)));
    }

    #[test]
    fn full_altcha_round_trip() {
        let key = "test-secret";
        let c = create_challenge(ChallengeOptions {
            hmac_key: key,
            max_number: Some(5_000),
            expires: Some(chrono::Utc::now() + chrono::TimeDelta::seconds(600)),
            ..Default::default()
        })
        .unwrap();

        let n = altcha_lib_rs::solve_challenge(&c.challenge, &c.salt, Some(c.algorithm), Some(5_000), 0)
            .unwrap();

        let payload = serde_json::json!({
            "algorithm": "SHA-256",
            "challenge": c.challenge,
            "number": n,
            "salt": c.salt,
            "signature": c.signature,
        })
        .to_string();

        assert!(verify_json_solution(&payload, key, true).is_ok());
        assert!(verify_json_solution(&payload, "wrong-key", true).is_err());
    }
}
