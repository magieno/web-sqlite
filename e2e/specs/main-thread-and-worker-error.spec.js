const htmlFilesToLoad = [
    "opfs-error.worker.html",
]

htmlFilesToLoad.forEach((htmlFile) => {
    describe(htmlFile, () => {
        beforeEach(async () => {
            await page.goto(`http://127.0.0.1:9000/${htmlFile}`, {
                headless: true,
            });

            await page.waitForSelector('#error');
        });

        it('should have the error alert', async () => {
            const errorFound = await page.evaluate(() => {
                return document.querySelector("#error") !== null;
            })

            expect(errorFound).toBeTruthy();
        });
    });
})
