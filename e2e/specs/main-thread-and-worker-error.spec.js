const htmlFilesToLoad = [
    // "memory.main-thread.html",
    // "memory.worker.html",
    "opfs-error.worker.html",
    //"opfs-sah.worker.html",
]

htmlFilesToLoad.forEach((htmlFile) => {
    describe(htmlFile, () => {
        beforeAll(async () => {
            await page.goto(`http://127.0.0.1:9000/${htmlFile}`, {
                headless: true,
            });

            await page.waitForSelector('#success');
        });

        it('should have the error alert', async () => {
            const alert = await page.$('#error');

            expect(alert).toBeDefined();
        });
    });
})
