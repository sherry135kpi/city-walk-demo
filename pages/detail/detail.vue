<template>
	<view class="page">
		<view class="hero">
			<view class="tag">{{ route.tag }}</view>
			<view class="title">{{ route.title }}</view>
			<view class="desc">{{ route.desc }}</view>
		</view>

		<view class="info">
			<view class="info-item">
				<text class="info-label">预计耗时</text>
				<text class="info-value">{{ route.duration }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">全程距离</text>
				<text class="info-value">{{ route.distance }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">低碳指数</text>
				<text class="info-value">🌿 很棒</text>
			</view>
		</view>

		<!-- 地图卡片：展示整条路线（路径线 + 沿途打卡点） -->
		<view class="map-card">
			<map
				class="map"
				:latitude="route.lat"
				:longitude="route.lng"
				:scale="14"
				:markers="routeMarkers"
				:polyline="polylineData"
				show-location
				@markertap="onMarkerTap"
			></map>
			<view class="map-overlay">
				<text class="map-dot">📍</text>
				<text class="map-text">起点：{{ route.title }}</text>
			</view>
		</view>

		<!-- 沿途打卡点清单：点击可在地图上定位 -->
		<view class="waypoints" v-if="routeWaypoints.length">
			<view class="wp-title">📍 沿途打卡点</view>
			<view
				class="wp-card"
				v-for="(w, i) in routeWaypoints"
				:key="i"
				@click="onOpenPoint(w)"
			>
				<view class="wp-index" :class="{ 'wp-end': i === routeWaypoints.length - 1 }">
					{{ i === routeWaypoints.length - 1 ? '终' : i + 1 }}
				</view>
				<view class="wp-info">
					<view class="wp-name">{{ w.name }}</view>
					<view class="wp-tip">点击在地图中定位 →</view>
				</view>
			</view>
		</view>

		<view class="tips">
			<view class="tips-title">🚶 出发前建议</view>
			<view class="tip-item" v-for="(tip, i) in tips" :key="i">· {{ tip }}</view>
		</view>

		<view class="actions">
			<button class="btn" @click="onGo">导航去起点 →</button>
			<!-- 收藏按钮：根据 isFav 显示不同文字和颜色 -->
			<button class="btn btn-fav" :class="isFav ? 'fav-on' : ''" @click="toggleFav">
				{{ isFav ? '⭐ 已收藏' : '☆ 收藏' }}
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				route: {
					id: '',
					tag: '',
					title: '',
					desc: '',
					duration: '',
					distance: '',
					lat: 23.1117,
					lng: 113.2391
				},
				isFav: false,
				tips: [
					'穿舒适的鞋子，步行距离较长',
					'出发前查看天气预报，备好雨具',
					'带一瓶水，沿途补给点较少',
					'遵守交通规则，留意脚下安全'
				]
			}
		},
		computed: {
			// 当前路线的沿途打卡点（老数据没有 waypoints 时降级为空数组）
			routeWaypoints() {
				return this.route.waypoints || []
			},
			// 路径线：起点 + 所有途经点连成一条线
			polylineData() {
				const points = [{ latitude: this.route.lat, longitude: this.route.lng }]
				this.routeWaypoints.forEach(w => {
					points.push({ latitude: w.lat, longitude: w.lng })
				})
				return [{
					points,
					color: '#1d7a4a',
					width: 4,
					arrowLine: true,
					borderColor: '#ffffff',
					borderWidth: 2
				}]
			},
			// 地图上的图钉：起点 + 每个沿途点
			routeMarkers() {
				const arr = [{
					id: 0,
					latitude: this.route.lat,
					longitude: this.route.lng,
					title: '起点 · ' + this.route.title,
					iconPath: '/static/marker.png',
					width: 30,
					height: 30
				}]
				this.routeWaypoints.forEach((w, i) => {
					arr.push({
						id: i + 1,
						latitude: w.lat,
						longitude: w.lng,
						title: w.name,
						iconPath: '/static/marker.png',
						width: 30,
						height: 30
					})
				})
				return arr
			}
		},
		onLoad(options) {
			// options 里是从首页传来的数据
			if (options.item) {
				this.route = JSON.parse(decodeURIComponent(options.item))
				// 进入页面时，检查这个路线是否已被收藏
				this.isFav = this.getFavList().includes(this.route.id)
			}
		},
		methods: {
			onGo() {
				// 打开系统地图：展示起点位置，并可直接发起导航
				uni.openLocation({
					latitude: this.route.lat,
					longitude: this.route.lng,
					name: this.route.title,
					address: this.route.desc,
					scale: 14,
					fail: (err) => {
						uni.showToast({ title: '打开地图失败，请检查地图 key 配置', icon: 'none' })
					}
				})
			},
			// 点击地图上的图钉：根据 marker 的 id 找到对应点并打开定位
			onMarkerTap(e) {
				const id = e.markerId
				if (id === 0) {
					this.onOpenPoint({ name: '起点 · ' + this.route.title, lat: this.route.lat, lng: this.route.lng })
				} else if (this.routeWaypoints[id - 1]) {
					this.onOpenPoint(this.routeWaypoints[id - 1])
				}
			},
			// 打开系统地图定位某个点（起点或沿途打卡点）
			onOpenPoint(w) {
				uni.openLocation({
					latitude: w.lat,
					longitude: w.lng,
					name: w.name,
					address: '',
					scale: 16,
					fail: () => {
						uni.showToast({ title: '打开地图失败，请检查地图 key 配置', icon: 'none' })
					}
				})
			},
			// 读取本地收藏列表（每次调用都拿最新的）
			getFavList() {
				const list = uni.getStorageSync('favList')
				return Array.isArray(list) ? list : []
			},
			// 切换收藏状态
			toggleFav() {
				const list = this.getFavList()
				if (this.isFav) {
					// 取消收藏：从列表里删掉
					const idx = list.indexOf(this.route.id)
					if (idx > -1) list.splice(idx, 1)
					uni.showToast({ title: '已取消收藏', icon: 'none' })
				} else {
					// 添加收藏：放进去
					list.push(this.route.id)
					uni.showToast({ title: '收藏成功', icon: 'none' })
				}
				// 保存回本地，并更新页面状态
				uni.setStorageSync('favList', list)
				this.isFav = !this.isFav
			}
		}
	}
</script>

<style>
	.page {
		min-height: 100vh;
		background: #ffffff;
		padding-bottom: 60rpx;
	}

	.hero {
		background: linear-gradient(180deg, #1d7a4a 0%, #3fbf7f 100%);
		color: #ffffff;
		padding: 80rpx 40rpx 70rpx;
	}

	.tag {
		display: inline-block;
		font-size: 24rpx;
		background: rgba(255, 255, 255, 0.25);
		padding: 8rpx 24rpx;
		border-radius: 999rpx;
		margin-bottom: 26rpx;
	}

	.title {
		font-size: 56rpx;
		font-weight: bold;
		margin-bottom: 18rpx;
	}

	.desc {
		font-size: 28rpx;
		opacity: 0.9;
	}

	.info {
		display: flex;
		justify-content: space-between;
		padding: 36rpx 40rpx;
		background: #ffffff;
		margin-top: -30rpx;
		border-radius: 24rpx;
		margin-left: 30rpx;
		margin-right: 30rpx;
		box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
	}

	.info-item {
		flex: 1;
		text-align: center;
	}

	.info-label {
		display: block;
		font-size: 24rpx;
		color: #8a978f;
		margin-bottom: 12rpx;
	}

	.info-value {
		font-size: 30rpx;
		color: #23463a;
		font-weight: bold;
	}

	.tips {
		padding: 40rpx;
	}

	.tips-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #23463a;
		margin-bottom: 24rpx;
	}

	.tip-item {
		font-size: 28rpx;
		color: #5a6b62;
		line-height: 1.9;
	}

	.btn {
		margin: 20rpx 40rpx;
		background: #1d7a4a;
		color: #ffffff;
		font-size: 32rpx;
		border-radius: 999rpx;
		border: none;
	}

	.btn::after {
		border: none;
	}

	/* 收藏按钮配色 */
	.btn-fav {
		background: #f5f7f6;
		color: #4a635a;
	}

	.btn-fav.fav-on {
		background: #fff7e0;
		color: #d99a1b;
	}

	/* 地图卡片 */
	.map-card {
		position: relative;
		margin: 0 30rpx;
		height: 480rpx;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 6rpx 24rpx rgba(29, 122, 74, 0.12);
	}

	.map {
		width: 100%;
		height: 100%;
	}

	.map-overlay {
		position: absolute;
		left: 24rpx;
		bottom: 24rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
		background: rgba(255, 255, 255, 0.95);
		padding: 12rpx 22rpx;
		border-radius: 999rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
	}

	.map-dot {
		font-size: 28rpx;
	}

	.map-text {
		font-size: 24rpx;
		color: #23463a;
		font-weight: bold;
	}

	/* 沿途打卡点清单 */
	.waypoints {
		padding: 40rpx;
	}

	.wp-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #23463a;
		margin-bottom: 24rpx;
	}

	.wp-card {
		display: flex;
		align-items: center;
		gap: 22rpx;
		background: #ffffff;
		border-radius: 20rpx;
		padding: 24rpx 28rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 6rpx 20rpx rgba(29, 122, 74, 0.06);
	}

	.wp-index {
		flex-shrink: 0;
		width: 52rpx;
		height: 52rpx;
		border-radius: 50%;
		background: #1d7a4a;
		color: #ffffff;
		font-size: 28rpx;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.wp-end {
		background: #ffb020;
	}

	.wp-info {
		flex: 1;
	}

	.wp-name {
		font-size: 30rpx;
		font-weight: bold;
		color: #23463a;
		margin-bottom: 8rpx;
	}

	.wp-tip {
		font-size: 24rpx;
		color: #9aa8a0;
	}
</style>
