const htmlFilesToLoad = [
    "memory.main-thread.html",
    "memory.worker.html",
    "opfs.worker.html",
    "opfs-sah.worker.html",
]

htmlFilesToLoad.forEach((htmlFile) => {
    describe(htmlFile, () => {
        beforeEach(async () => {
            await page.goto(`http://127.0.0.1:9000/${htmlFile}`, {
                headless: true,
            });

            await page.waitForSelector('#success');
        });

        it('should have three entries in the page', async () => {
            const tbody = await page.$('#users');
            const children = await page.evaluate(() => {
                return Array.from(document.querySelector("#users").children);
            })

            expect(children.length).toBe(3);
        });
    });
})
