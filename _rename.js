// 临时脚本：将 static/tabbar 下的中文图标重命名为简洁英文文件名
const fs = require('fs')
const path = require('path')
const dir = path.join(__dirname, 'static', 'tabbar')
console.log('扫描目录：', dir)
let files = []
try {
	files = fs.readdirSync(dir)
} catch (e) {
	console.log('找不到目录，请确认当前工作目录是否为项目根目录')
	process.exit(1)
}
const map = { '首页': 'home', '收藏': 'fav', '我的': 'me' }
files.forEach(f => {
	for (const key in map) {
		if (f.indexOf(key) !== -1) {
			const old = path.join(dir, f)
			const target = path.join(dir, map[key] + '.png')
			if (fs.existsSync(target)) fs.unlinkSync(target)
			fs.renameSync(old, target)
			console.log('重命名：', f, '→', map[key] + '.png')
		}
	}
})
console.log('完成')
