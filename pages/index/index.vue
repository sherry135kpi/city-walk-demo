<template>
	<view class="page">
		<!-- 顶部标题区 -->
		<view class="header">
			<view class="title-row">
				<view class="title">🚶 CityWalk</view>
				<!-- 收藏入口 -->
				<view class="fav-entry" @click="goFav">
					<text class="fav-icon">⭐</text>
					<text class="fav-text">我的收藏</text>
				</view>
			</view>
			<view class="subtitle">用绿色出行，发现城市的文化与美好</view>
		</view>

		<!-- 搜索框 -->
		<view class="search-bar">
			<text class="search-icon">🔍</text>
			<input
				class="search-input"
				v-model="keyword"
				placeholder="搜索路线，如：老城、艺术、江边"
			/>
			<text v-if="keyword" class="search-clear" @click="keyword = ''">✕</text>
		</view>

		<!-- 筛选标签 -->
		<view class="tag-row">
			<view
				class="tag"
				v-for="tag in tags"
				:key="tag"
				:class="{ 'tag-active': activeTag === tag }"
				@click="switchTag(tag)"
			>{{ tag }}</view>
		</view>

		<!-- 路线总览：按真实经纬度方位排布所有路线起点，点击直达详情 -->
		<view class="overview">
			<view class="overview-title">🗺️ 路线总览</view>
			<view class="overview-map">
				<view class="deco deco-river"></view>
				<view class="deco deco-park"></view>
				<view
					class="point"
					v-for="(p, index) in mapPoints"
					:key="index"
					:style="{ left: p.left, top: p.top }"
					@click="onTapRoute(p.route)"
				>
					<view class="point-pin">📍</view>
					<view class="point-label">{{ p.route.title }}</view>
				</view>
			</view>
			<view class="overview-tip">点地图上的图钉，快速进入路线详情</view>
		</view>

		<!-- 路线卡片列表 -->
		<view class="list">
			<view
				class="card"
				v-for="(route, index) in displayRoutes"
				:key="index"
				@click="onTapRoute(route)"
			>
				<view class="card-tag">{{ route.tag }}</view>
				<view class="card-title-row">
					<view class="card-title">{{ route.title }}</view>
					<!-- 收藏过的路线，卡片右上角显示星星 -->
					<text v-if="isFav(route.id)" class="card-star">⭐</text>
				</view>
				<view class="card-desc">{{ route.desc }}</view>
				<view class="card-meta">
					<text class="meta-item">👣 {{ route.duration }}</text>
					<text class="meta-item">📍 {{ route.distance }}</text>
					<text class="meta-item">🌿 低碳</text>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view v-if="displayRoutes.length === 0" class="empty">
			<text class="empty-icon">🔍</text>
			<text class="empty-text">没有找到匹配的路线，换个关键词或筛选条件试试</text>
		</view>

		<!-- 猜你喜欢 -->
		<view class="recommend" v-if="recommendRoutes.length">
			<view class="recommend-title">✨ 猜你喜欢</view>
			<view
				class="rec-card"
				v-for="(route, index) in recommendRoutes"
				:key="index"
				@click="onTapRoute(route)"
			>
				<view class="rec-tag">{{ route.tag }}</view>
				<view class="rec-info">
					<view class="rec-name">{{ route.title }}</view>
					<view class="rec-meta">👣 {{ route.duration }} · 📍 {{ route.distance }}</view>
				</view>
				<text class="rec-arrow">›</text>
			</view>
		</view>

		<!-- 底部按钮 -->
		<button class="start-btn" @click="onStart">开始探索 →</button>
	</view>
</template>

<script>
	// 从公共数据文件导入路线数据（不再自己写，保证全城统一）
	import { routes } from '../../common/data.js'

	export default {
		data() {
			return {
				// 搜索关键词（v-model 绑定到输入框）
				keyword: '',
				// 当前选中的筛选标签，默认「全部」
				activeTag: '全部',
				// 顶部可选的筛选标签
				tags: ['全部', '经典', '人文', '休闲', '亲子', '网红'],
				// 路线数据：直接使用导入进来的数组
				routes,
			}
		},
		computed: {
			// 根据「搜索关键词 + 筛选标签」自动计算要展示的路线列表
			displayRoutes() {
				return this.routes.filter(route => {
					// 1. 标签筛选：「全部」时不过滤
					const matchTag =
						this.activeTag === '全部' || route.tag === this.activeTag
					// 2. 关键词搜索：标题或描述中包含关键词即可
					const kw = this.keyword.trim()
					const matchKw =
						kw === '' || route.title.includes(kw) || route.desc.includes(kw)
					return matchTag && matchKw
				})
			},
			// 猜你喜欢：根据收藏过的路线标签，推荐相同标签的其它路线
			recommendRoutes() {
				const fav = uni.getStorageSync('favList')
				const favList = Array.isArray(fav) ? fav : []
				// 收藏过的路线的标签
				const favTags = this.routes
					.filter(r => favList.includes(r.id))
					.map(r => r.tag)
				// 还没收藏的路线，优先排「标签相同」的前面
				const notFav = this.routes.filter(r => !favList.includes(r.id))
				const pool = [...notFav.filter(r => favTags.includes(r.tag)), ...notFav]
				// 去重后取前 2 条
				const seen = []
				const rec = []
				for (const r of pool) {
					if (!seen.includes(r.id)) {
						seen.push(r.id)
						rec.push(r)
					}
				}
				return rec.slice(0, 2)
			},
			// 路线总览图：把每条路线的经纬度归一化成地图上的相对位置
			mapPoints() {
				const list = this.routes
				const lats = list.map(r => r.lat)
				const lngs = list.map(r => r.lng)
				const minLat = Math.min(...lats)
				const maxLat = Math.max(...lats)
				const minLng = Math.min(...lngs)
				const maxLng = Math.max(...lngs)
				const spanLat = maxLat - minLat || 1
				const spanLng = maxLng - minLng || 1
				const pts = []
				// default percentage range 8%~92% (leave margins). 归一化到该区间。
				list.forEach(route => {
					const x = (route.lng - minLng) / spanLng
					const y = (maxLat - route.lat) / spanLat
					let left = 8 + x * 84
					let top = 8 + y * 84
					// 简易防重叠：与已有点太近就向右下错开，越界则改为反向
					while (pts.some(p => Math.abs(p.left - left) < 12 && Math.abs(p.top - top) < 14)) {
						if (left + 14 <= 92 && top + 10 <= 92) { left += 14; top += 10 }
						else { left -= 14; top -= 10 }
					}
					pts.push({ route, left: left.toFixed(2) + '%', top: top.toFixed(2) + '%' })
				})
				return pts
			}
		},
		methods: {
			// 判断某条路线是否被收藏
			isFav(id) {
				const list = uni.getStorageSync('favList')
				return Array.isArray(list) && list.includes(id)
			},
			onTapRoute(route) {
				// 跳转到详情页，并把路线数据序列化后传过去
				uni.navigateTo({
					url: '/pages/detail/detail?item=' + encodeURIComponent(JSON.stringify(route))
				})
			},
			// 跳转到收藏页（收藏页已是底部 tab 页面，用 switchTab）
			goFav() {
				uni.switchTab({ url: '/pages/fav/fav' })
			},
			// 点击某个筛选标签时，切换当前选中的标签
			switchTag(tag) {
				this.activeTag = tag
			},
			onStart() {
				uni.showToast({
					title: 'CityWalk 马上出发！',
					icon: 'none'
				})
			}
		}
	}
</script>

<style>
	.page {
		min-height: 100vh;
		background: linear-gradient(180deg, #e9f7ef 0%, #ffffff 40%);
		padding: 40rpx 30rpx 60rpx;
		box-sizing: border-box;
	}

	.header {
		padding: 30rpx 10rpx 40rpx;
	}

	.title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.title {
		font-size: 64rpx;
		font-weight: bold;
		color: #1d7a4a;
	}

	/* 收藏入口按钮 */
	.fav-entry {
		display: flex;
		align-items: center;
		gap: 8rpx;
		background: #ffffff;
		padding: 14rpx 24rpx;
		border-radius: 999rpx;
		box-shadow: 0 4rpx 16rpx rgba(29, 122, 74, 0.1);
	}

	.fav-icon {
		font-size: 28rpx;
	}

	.fav-text {
		font-size: 26rpx;
		color: #23463a;
		font-weight: bold;
	}

	.subtitle {
		margin-top: 16rpx;
		font-size: 28rpx;
		color: #6b7a72;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.card {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 32rpx;
		box-shadow: 0 6rpx 24rpx rgba(29, 122, 74, 0.08);
		border-left: 8rpx solid #3fbf7f;
	}

	.card-tag {
		display: inline-block;
		font-size: 22rpx;
		color: #1d7a4a;
		background: #e4f5ec;
		padding: 6rpx 18rpx;
		border-radius: 999rpx;
		margin-bottom: 16rpx;
	}

	.card-title {
		font-size: 38rpx;
		font-weight: bold;
		color: #23463a;
		margin-bottom: 10rpx;
	}

	.card-title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.card-star {
		font-size: 32rpx;
	}

	.card-desc {
		font-size: 26rpx;
		color: #7a8a82;
		margin-bottom: 20rpx;
	}

	.card-meta {
		display: flex;
		gap: 24rpx;
	}

	.meta-item {
		font-size: 24rpx;
		color: #4a635a;
	}

	.start-btn {
		margin-top: 44rpx;
		background: #1d7a4a;
		color: #ffffff;
		font-size: 32rpx;
		border-radius: 999rpx;
		border: none;
	}

	.start-btn::after {
		border: none;
	}

	/* 搜索框 */
	.search-bar {
		display: flex;
		align-items: center;
		gap: 16rpx;
		background: #ffffff;
		border-radius: 999rpx;
		padding: 20rpx 28rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(29, 122, 74, 0.08);
	}

	.search-icon {
		font-size: 28rpx;
	}

	.search-input {
		flex: 1;
		font-size: 28rpx;
		color: #23463a;
	}

	.search-clear {
		font-size: 30rpx;
		color: #9aa8a0;
		padding: 0 8rpx;
	}

	/* 筛选标签栏 */
	.tag-row {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-bottom: 30rpx;
	}

	.tag {
		font-size: 26rpx;
		color: #4a635a;
		background: #ffffff;
		padding: 12rpx 30rpx;
		border-radius: 999rpx;
		border: 2rpx solid #d9e8e0;
	}

	.tag-active {
		color: #ffffff;
		background: #1d7a4a;
		border-color: #1d7a4a;
	}

	/* 空状态 */
	.empty {
		padding: 120rpx 40rpx;
		text-align: center;
	}

	.empty-icon {
		font-size: 80rpx;
		display: block;
		margin-bottom: 20rpx;
	}

	.empty-text {
		font-size: 26rpx;
		color: #9aa8a0;
	}

	/* 猜你喜欢 */
	.recommend {
		margin-top: 44rpx;
		padding-top: 30rpx;
		border-top: 2rpx solid #e4efe8;
	}

	.recommend-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #23463a;
		margin-bottom: 24rpx;
	}

	.rec-card {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 24rpx 26rpx;
		background: #ffffff;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 6rpx 20rpx rgba(29, 122, 74, 0.06);
	}

	.rec-tag {
		flex-shrink: 0;
		font-size: 22rpx;
		color: #1d7a4a;
		background: #e4f5ec;
		padding: 6rpx 16rpx;
		border-radius: 999rpx;
	}

	.rec-info {
		flex: 1;
	}

	.rec-name {
		font-size: 30rpx;
		font-weight: bold;
		color: #23463a;
		margin-bottom: 8rpx;
	}

	.rec-meta {
		font-size: 24rpx;
		color: #7a8a82;
	}

	.rec-arrow {
		font-size: 44rpx;
		color: #c2ccc6;
	}

	/* 路线总览 */
	.overview {
		margin-bottom: 30rpx;
	}

	.overview-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #23463a;
		margin-bottom: 20rpx;
	}

	.overview-map {
		position: relative;
		height: 560rpx;
		border-radius: 24rpx;
		overflow: hidden;
		background: linear-gradient(160deg, #eaf6ee 0%, #dcefdf 55%, #d3e6e8 100%);
		box-shadow: 0 6rpx 24rpx rgba(29, 122, 74, 0.12);
	}

	/* 装饰：河流 */
	.deco-river {
		position: absolute;
		right: -20%;
		top: -10%;
		width: 130%;
		height: 90rpx;
		background: linear-gradient(90deg, rgba(120, 190, 210, 0.0), rgba(120, 190, 210, 0.5), rgba(120, 190, 210, 0.0));
		transform: rotate(-18deg);
		border-radius: 60rpx;
	}

	/* 装饰：绿地 */
	.deco-park {
		position: absolute;
		left: -6%;
		bottom: -8%;
		width: 55%;
		height: 46%;
		background: radial-gradient(circle, rgba(63, 191, 127, 0.35), rgba(63, 191, 127, 0));
		border-radius: 50%;
	}

	/* 路线图钉 */
	.point {
		position: absolute;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		width: 190rpx;
		text-align: center;
	}

	.point-pin {
		font-size: 44rpx;
		line-height: 1;
		filter: drop-shadow(0 3rpx 6rpx rgba(0, 0, 0, 0.25));
	}

	.point-label {
		margin-top: 6rpx;
		font-size: 20rpx;
		color: #23463a;
		font-weight: bold;
		background: rgba(255, 255, 255, 0.92);
		padding: 4rpx 12rpx;
		border-radius: 999rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
		white-space: nowrap;
	}

	.overview-tip {
		margin-top: 16rpx;
		text-align: center;
		font-size: 24rpx;
		color: #9aa8a0;
	}
</style>
