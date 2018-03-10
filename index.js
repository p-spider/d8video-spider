/***
 * Puppeteer
 */

const fs = require('fs');
const request = require('request');
const puppeteer = require('puppeteer');

function parseListPage() {
	let ele = $(".v-search-video-box-video-info .xvideo-thumbnail-mask");

	let u = [];
	ele.each(function (index, elem) {
		let href = elem.href;
		u.push(href)
	});

	return u;
}

function parseVideoPage() {
	return {
		name: window.document.title + '.mp4',
		src: window.xvideoData.html5_href
	};
}

function download(fileName, filePath) {
	let reqConfig = {
		url: filePath,
		method: 'get',
		header: this.header
	};
	let stream = fs.createWriteStream('./video/' + fileName);
	return new Promise((resolve, reject) => {
		request(reqConfig)
			.on('error', (err) => {
				logger.error(`wget file err: ${err}`);
				reject(err)
			})
			.pipe(stream)
			.on('close', () => {
				resolve(void(0))
			});
	})
}

class Spider {
	constructor() {
		this.conf = {
			headless: false,
			devtools: false,
		};
		this.browser = null;
	}

	async init() {
		this.browser = await puppeteer.launch(this.conf);
		this.fetcher = await puppeteer.createBrowserFetcher({
			host: 'http://d8.cdc8.space',
			path: './video'
		});
	}


	async openListPage(url) {
		let page = await this.browser.newPage();
		await page.goto(url);
		await page.waitForSelector('.v-search-video-box-video-info .xvideo-thumbnail-mask', {timeout: 3000 * 90});
		let urlList = await page.evaluate(parseListPage);
		page.close();
		return urlList;
	}


	async openVideoPage(url) {
		let page = await this.browser.newPage();
		await page.goto(url);
		let urlList = await page.evaluate(parseVideoPage);
		page.close();
		return urlList;
	}

	async saveVideo(url) {
		let page = await this.browser.newPage();
		await page.goto(url);
		await page.focus('body');
		return '';
	}


	async run() {
		await this.init();
		for (let i = 1; i < 1000; i++) {
			let url = `http://d8.cdc8.space/v/search?title=%E5%AB%A9%E5%A6%B9&page=${i}`;
			let urlList = await this.openListPage(url);
			console.dir(urlList);

			for (let _url of urlList) {
				let {name, src} = await this.openVideoPage(_url);
				console.dir(name, src);
				await download(name, src);
			}
		}
	}
}

let spider = new Spider();
spider.run();