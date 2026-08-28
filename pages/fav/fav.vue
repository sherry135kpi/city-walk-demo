<template>
	<view class="page">
		<view class="header">
			<view class="title">⭐ 我的收藏</view>
			<view class="subtitle" v-if="favRoutes.length > 0">共收藏了 {{ favRoutes.length }} 条路线</view>
		</view>

		<!-- 有收藏时：显示列表 -->
		<view class="list" v-if="favRoutes.length > 0">
			<view
				class="card"
				v-for="(route, index) in favRoutes"
				:key="index"
				@click="onTapRoute(route)"
			>
				<view class="card-tag">{{ route.tag }}</view>
				<view class="card-title">{{ route.title }}</view>
				<view class="card-desc">{{ route.desc }}</view>
				<view class="card-meta">
					<text class="meta-item">👣 {{ route.duration }}</text>
					<text class="meta-item">📍 {{ route.distance }}</text>
				</view>
			</view>
		</view>

		<!-- 没有收藏时：空状态提示 -->
		<view class="empty" v-else>
			<view class="empty-icon">🗺️</view>
			<view class="empty-text">还没有收藏的路线</view>
			<view class="empty-tip">去首页挑选喜欢的 CityWalk 路线吧</view>
		</view>
	</view>
</template>

<script>
	// 从公共数据文件导入路线数据（与首页、我的页共用同一份）
	import { routes } from '../../common/data.js'

	export default {
		data() {
			return {
				// 路线数据：直接使用导入进来的数组
				routes,
				favRoutes: []
			}
		},
		onShow() {
			// 每次页面显示时都重新读收藏，保证最新（比如从详情页取消收藏回来）
			const list = uni.getStorageSync('favList')
			const favIds = Array.isArray(list) ? list : []
			// 根据收藏的 id，从 routes 里筛出对应路线
			this.favRoutes = this.routes.filter(r => favIds.includes(r.id))
		},
		methods: {
			onTapRoute(route) {
				uni.navigateTo({
					url: '/pages/detail/detail?item=' + encodeURIComponent(JSON.stringify(route))
				})
			}
		}
	}
</script>

<style>
	.page {
		min-height: 100vh;
		background: #f4f8f5;
		padding: 40rpx 30rpx 60rpx;
		box-sizing: border-box;
	}

	.header {
		padding: 20rpx 10rpx 34rpx;
	}

	.title {
		font-size: 52rpx;
		font-weight: bold;
		color: #1d7a4a;
	}

	.subtitle {
		margin-top: 12rpx;
		font-size: 26rpx;
		color: #7a8a82;
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

	/* 空状态样式 */
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 180rpx;
	}

	.empty-icon {
		font-size: 100rpx;
		margin-bottom: 30rpx;
	}

	.empty-text {
		font-size: 34rpx;
		color: #4a635a;
		font-weight: bold;
	}

	.empty-tip {
		margin-top: 14rpx;
		font-size: 26rpx;
		color: #9aa8a0;
	}
</style>
