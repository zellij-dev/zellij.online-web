(function () {
    var root = document.querySelector('.zo-termshare')
    if (!root || !window.gsap) return

    function token(name, fallback) {
        var v = getComputedStyle(root).getPropertyValue(name).trim()
        return v || fallback
    }

    function terminalSharing() {
        const gray = token('--zo-border', '#2c2c3a')
        const green = token('--zo-accent', '#a3e05e')
        const firstPrompt = ['.zo-termshare .g459180']
        const firstLineIds = [
            '.zo-termshare .path456518',
            '.zo-termshare .path456520',
            '.zo-termshare .path456522',
            '.zo-termshare .path456524',
            '.zo-termshare .path456526',
            '.zo-termshare .path456528',
            '.zo-termshare .path456530',
            '.zo-termshare .path456532',
            '.zo-termshare .path456534',
            '.zo-termshare .path456536',
            '.zo-termshare .path456538',
            '.zo-termshare .path456540',
            '.zo-termshare .path456542',
            '.zo-termshare .path456544',
            '.zo-termshare .path456546',
            '.zo-termshare .path456548',
            '.zo-termshare .path456550'
        ]
        const secondLineId = '.zo-termshare .text306031-5'
        const thirdLineId = '.zo-termshare .text306031-5-9'
        const fourthLineIds = [
            '.zo-termshare .path458706',
            '.zo-termshare .path458708',
            '.zo-termshare .path458710',
            '.zo-termshare .path458712',
            '.zo-termshare .path458714',
            '.zo-termshare .path458716',
            '.zo-termshare .path458718',
            '.zo-termshare .path458720',
            '.zo-termshare .path458722',
            '.zo-termshare .path458724',
            '.zo-termshare .path458726',
            '.zo-termshare .path458728',
            '.zo-termshare .path458730',
            '.zo-termshare .path458732',
            '.zo-termshare .path458734',
            '.zo-termshare .path458736',
            '.zo-termshare .path458738',
            '.zo-termshare .path458740',
            '.zo-termshare .path458742'
        ]

        const fifthLineId = '.zo-termshare .text306031-5-4'
        const sixthLineId = '.zo-termshare .text306031-5-9-8'
        const seventhLineId = '.zo-termshare .text306031-5-9-0-1'
        const fullPane = '.zo-termshare .full-pane'
        const lowerPane = '.zo-termshare .lower-pane'
        const upperPane = '.zo-termshare .upper-pane'
        const lowerPaneTitle = '.zo-termshare .lower-pane-title'
        const lowerPaneTitleText = '.zo-termshare .tspan13287-4-0-8'
        const upperPaneTitle = '.zo-termshare .upper-pane-title'
        const upperPaneTitleText = '.zo-termshare .tspan13287-4-0'
        const alicesPane = '.zo-termshare .alices-pane'
        const alicesPaneTitle = '.zo-termshare .alices-pane-title'
        const lowerPaneHalf = '.zo-termshare .rect9847-7'
        const upperPaneHalf = '.zo-termshare .rect9847-7-5'
        const lowerPaneHalfTitle = '.zo-termshare .g508274'
        const lowerPaneHalfTitleText =
            '.zo-termshare .lower-pane-title-text-2-1-1'
        const upperPaneHalfTitle = '.zo-termshare .g508339'

        const lowerPaneFirstLineIds = [
            '.zo-termshare .path464011',
            '.zo-termshare .path464013',
            '',
            '.zo-termshare .path464015',
            '.zo-termshare .path464017',
            '',
            '.zo-termshare .path464019',
            '.zo-termshare .path464021',
            '.zo-termshare .path464023',
            '.zo-termshare .path464025',
            '.zo-termshare .path464027',
            '.zo-termshare .path464029',
            '.zo-termshare .path464031',
            '.zo-termshare .path464033',
            '.zo-termshare .path464035',
            '.zo-termshare .path464037',
            '.zo-termshare .path464039',
            '.zo-termshare .path464041',
            '.zo-termshare .path464043',
            '.zo-termshare .path464045',
            '.zo-termshare .path464047',
            '.zo-termshare .path464049',
            '.zo-termshare .path464051',
            '.zo-termshare .path464053',
            '.zo-termshare .path464055',
            '.zo-termshare .path464057',
            '.zo-termshare .path464059',
            '.zo-termshare .path464061',
            '.zo-termshare .path464063'
        ]
        const lowerPaneSecondLineId = '.zo-termshare .g463929'
        const lowerPaneThirdLineId = '.zo-termshare .g463935'
        const lowerPaneFourthLineId = '.zo-termshare .g463945'
        const lowerPaneFifthLineId = '.zo-termshare .text306031-5-9-0-1-7'
        const lowerPaneFifthAfterPromptLineIds = [
            '.zo-termshare .path490277',
            '.zo-termshare .path490279',
            '',
            '.zo-termshare .path490281',
            '.zo-termshare .path490283',
            '.zo-termshare .path490285',
            '',
            '.zo-termshare .path490287',
            '.zo-termshare .path490289',
            '.zo-termshare .path490291',
            '.zo-termshare .path490293',
            '.zo-termshare .path490295',
            '.zo-termshare .path490297'
        ]
        const lowerPaneSixthLineId = '.zo-termshare .text306031-5-9-0-1-7-2'
        const aliceJoinOverlay = '.zo-termshare .g497595'

        const alicesVimCommand = [
            '.zo-termshare .path510517',
            '.zo-termshare .path510519',
            '.zo-termshare .path510521',
            '.zo-termshare .path510523',
            '.zo-termshare .path510525',
            '',
            '.zo-termshare .path510527',
            '.zo-termshare .path510529',
            '.zo-termshare .path510531',
            '.zo-termshare .path510533',
            '.zo-termshare .path510535',
            '.zo-termshare .path510537',
            '.zo-termshare .path510539',
            '.zo-termshare .path510541',
            '.zo-termshare .path510543',
            '.zo-termshare .path510545',
            '.zo-termshare .path510547',
            '.zo-termshare .path510549',
            '.zo-termshare .path510551',
            '.zo-termshare .path510553',
            '.zo-termshare .path510555',
            '.zo-termshare .path510557',
            '.zo-termshare .path510559',
            '.zo-termshare .path510561',
            '.zo-termshare .path510563',
            '.zo-termshare .path510565',
            '.zo-termshare .path510567'
        ]

        const bobTitle = '.zo-termshare .bob-title'

        const falseText = [
            '.zo-termshare .path605562',
            '.zo-termshare .path605564',
            '.zo-termshare .path605566',
            '.zo-termshare .path605568',
            '.zo-termshare .path605570'
        ]
        const trueText = '.zo-termshare .text586292'
        const vimFile = '.zo-termshare .g549457'

        const startSessionSuccessful = '.zo-termshare .g610596'
        const serverRunning = '.zo-termshare .g639450'

        const greenCursor = '.zo-termshare .green-cursor'
        const cyanCursor = '.zo-termshare .cyan-cursor'
        const mainTimeline = gsap
            .timeline({ repeat: '-1', repeatDelay: 3 })
            .timeScale(1.5)
            .add(typeFirstCommand(), 0)

        function typeFirstCommand() {
            var tl = gsap.timeline()

            changeElement(tl, greenCursor, { x: '-=35.2', duration: 0 }, 0)

            typeLine(tl, firstLineIds.slice(0, 5), greenCursor, 0)
            changeManyElements(
                tl,
                firstLineIds.slice(5),
                { opacity: 1, duration: 0, delay: 0.2 },
                '>+0.5'
            )
            changeElement(tl, greenCursor, { x: '+=23.5', duration: 0 }, '<')

            changeElement(
                tl,
                greenCursor,
                { y: '+=5.5', x: '-=39', duration: 0.1 },
                '>+0.4'
            )

            changeElement(tl, secondLineId, { opacity: 1, duration: 0 }, '>+0.4')
            changeElement(tl, greenCursor, { x: '+=21', duration: 0 }, '<')

            changeElement(tl, thirdLineId, { opacity: 1, duration: 0 }, '>+0.4')
            changeElement(
                tl,
                greenCursor,
                { y: '+=11', x: '-=16', duration: 0 },
                '<'
            )
            changeElement(
                tl,
                fourthLineIds.slice(0, 2),
                { opacity: 1, duration: 0 },
                '<'
            )

            changeElement(tl, fullPane, { opacity: 0, duration: 0 }, '>+0.4')
            changeElement(
                tl,
                upperPane,
                { opacity: 1, stroke: gray, duration: 0 },
                '<'
            )
            changeElement(
                tl,
                upperPaneTitleText,
                { opacity: 1, fill: gray, duration: 0 },
                '<'
            )
            changeElement(tl, lowerPane, { opacity: 1, duration: 0 }, '<')
            changeElement(tl, lowerPaneTitle, { opacity: 1, duration: 0 }, '<')
            changeManyElements(
                tl,
                lowerPaneFirstLineIds.slice(0, 2),
                { opacity: 1, duration: 0 },
                '<'
            )
            changeElement(tl, greenCursor, { y: '+=31.2', duration: 0.1 }, '<')

            typeLine(tl, lowerPaneFirstLineIds.slice(2), greenCursor, '>+0.5')

            changeManyElements(
                tl,
                [
                    lowerPaneSecondLineId,
                    lowerPaneThirdLineId,
                    lowerPaneFourthLineId,
                    lowerPaneFifthLineId
                ],
                { opacity: 1, duration: 0 },
                '>+0.5'
            )
            changeElement(
                tl,
                greenCursor,
                { y: '+=19', x: '-=51', duration: 0 },
                '<'
            )

            typeLine(tl, lowerPaneFifthAfterPromptLineIds, greenCursor, '>+0.5')
            changeElement(
                tl,
                greenCursor,
                { y: '+=5', x: '-=25', duration: 0 },
                '<+0.5'
            )
            changeElement(
                tl,
                lowerPaneSixthLineId,
                { opacity: 1, duration: 0 },
                '<'
            )

            changeElement(tl, upperPane, { stroke: green, duration: 0 }, '>+0.5')
            changeElement(tl, upperPaneTitleText, { fill: green, duration: 0 }, '<')
            changeElement(tl, lowerPane, { stroke: gray, duration: 0 }, '<')
            changeElement(tl, lowerPaneTitleText, { fill: gray, duration: 0 }, '<')
            changeElement(tl, greenCursor, { y: '-=55', duration: 0.2 }, '<+0.5')

            changeElement(tl, aliceJoinOverlay, { opacity: 1, duration: 0 }, '>0.5')
            changeElement(tl, aliceJoinOverlay, { opacity: 0, duration: 0 }, '>2')
            changeManyElements(
                tl,
                [
                    upperPane,
                    upperPaneTitleText,
                    lowerPane,
                    lowerPaneTitle,
                    lowerPaneTitleText,
                    upperPaneTitle,
                    upperPaneTitleText
                ],
                { opacity: 0, duration: 0 },
                '<'
            )
            changeManyElements(
                tl,
                [
                    alicesPane,
                    alicesPaneTitle,
                    lowerPaneHalf,
                    lowerPaneHalfTitle,
                    upperPaneHalf,
                    bobTitle,
                    cyanCursor,
                    alicesVimCommand.slice(0, 2)
                ],
                { opacity: 1, duration: 0 },
                '<'
            )
            changeElement(
                tl,
                lowerPaneHalfTitleText,
                { fill: gray, duration: 0 },
                '<'
            )
            changeElement(tl, lowerPaneHalf, { stroke: gray, duration: 0 }, '<')

            typeLine(tl, alicesVimCommand.slice(2), cyanCursor, '>+0.5')
            changeElement(tl, cyanCursor, { opacity: 0, duration: 0 }, '>+0.3')

            changeManyElements(
                tl,
                alicesVimCommand.filter((e) => e.startsWith('.zo-termshare .')),
                { opacity: 0, duration: 0 },
                '>'
            )
            changeManyElements(
                tl,
                [vimFile, trueText, cyanCursor],
                { opacity: 1, duration: 0 },
                '>'
            )
            changeElement(
                tl,
                cyanCursor,
                { x: '-=35', y: '+=1.5', duration: 0 },
                '<'
            )

            changeElement(
                tl,
                cyanCursor,
                { x: '+=24.5', y: '+=2.5', duration: 0 },
                '>+0.5'
            )
            changeElement(
                tl,
                cyanCursor,
                { x: '-=19.5', y: '+=2.5', duration: 0 },
                '>+0.2'
            )
            changeElement(
                tl,
                cyanCursor,
                { x: '+=24.5', y: '+=2.5', duration: 0 },
                '>+0.5'
            )
            changeElement(
                tl,
                cyanCursor,
                { x: '-=15.5', y: '+=2.4', duration: 0 },
                '>+0.2'
            )
            changeElement(
                tl,
                cyanCursor,
                { x: '+=20', y: '+=3', duration: 0 },
                '>+0.2'
            )

            changeElement(tl, cyanCursor, { x: '-=7.5', duration: 0 }, '>+0.5')
            changeElement(tl, trueText, { opacity: 0, duration: 0 }, '<')

            typeLine(tl, falseText, cyanCursor, '>+0.5')

            changeElement(tl, fourthLineIds, { opacity: 1, duration: 0 }, '>+0.4')
            changeElement(tl, greenCursor, { x: '+=34', duration: 0 }, '<')

            changeElement(tl, serverRunning, { opacity: 1, duration: 0 }, '>+0.5')
            changeElement(
                tl,
                startSessionSuccessful,
                { opacity: 0, duration: 0 },
                '<'
            )
            changeManyElements(tl, firstPrompt, { opacity: 0, duration: 0 }, '<')
            changeManyElements(tl, firstLineIds, { opacity: 0, duration: 0 }, '<')
            changeElement(tl, secondLineId, { opacity: 0, duration: 0 }, '<')
            changeElement(tl, thirdLineId, { opacity: 0, duration: 0 }, '<')
            changeManyElements(tl, fourthLineIds, { opacity: 0, duration: 0 }, '<')
            changeElement(tl, fifthLineId, { opacity: 0, duration: 0 }, '<')
            changeElement(tl, sixthLineId, { opacity: 0, duration: 0 }, '<')
            changeElement(tl, seventhLineId, { opacity: 0, duration: 0 }, '<')
            changeElement(tl, greenCursor, { opacity: 0, duration: 0 }, '<')

            return tl
        }

        function typeLine(tl, ids, cursor, phaseNuber) {
            let durations = [
                0.05, 0.025, 0.025, 0.025, 0.05, 0.025, 0.025, 0.025, 0.05, 0.025
            ]
            if (ids[0].startsWith('.zo-termshare .')) {
                changeElement(
                    tl,
                    ids[0],
                    { opacity: 1, delay: durations[0], duration: 0 },
                    phaseNuber
                )
                changeElement(tl, cursor, { x: '+=1.9', duration: 0 }, '<')
            } else {
                changeElement(tl, cursor, { x: '+=1.9', duration: 0 }, phaseNuber)
            }
            for (let i = 1; i < ids.length; i++) {
                let currentId = ids[i]
                let duration = durations[i % durations.length]
                if (currentId.startsWith('.zo-termshare .')) {
                    changeElement(
                        tl,
                        currentId,
                        { opacity: 1, delay: duration, duration: 0 },
                        '<'
                    )
                    changeElement(tl, cursor, { x: '+=1.9', duration: 0 }, '<')
                } else {
                    changeElement(
                        tl,
                        cursor,
                        { x: '+=1.9', delay: duration, duration: 0 },
                        '<'
                    )
                }
            }
        }

        function changeElement(tl, el, attrs, phaseNumber) {
            tl.to(el, Object.assign({}, { duration: 0.5 }, attrs), phaseNumber)
        }
        function changeManyElements(tl, elements, attrs, phaseNumber) {
            tl.to(
                elements.join(', '),
                Object.assign({}, { duration: 0.5 }, attrs),
                phaseNumber
            )
        }

        return mainTimeline
    }

    var timeline = terminalSharing()

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        timeline.pause(timeline.duration() * 0.8)
        return
    }

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    timeline.play()
                } else {
                    timeline.pause()
                }
            }
        })
        observer.observe(root)
    }
})()
