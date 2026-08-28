<template>
	<view class="page">
		<!-- 个人信息卡 -->
		<view class="profile">
			<view class="avatar">🚶</view>
			<view class="profile-info">
				<view class="profile-name">绿色出行爱好者</view>
				<view class="profile-desc">用脚步丈量城市的美好</view>
			</view>
		</view>

		<!-- 统计卡片 -->
		<view class="stats">
			<view class="stat">
				<view class="stat-num">{{ favCount }}</view>
				<view class="stat-label">收藏路线</view>
			</view>
			<view class="stat">
				<view class="stat-num">{{ routes.length }}</view>
				<view class="stat-label">城市路线</view>
			</view>
			<view class="stat">
				<view class="stat-num">🌿</view>
				<view class="stat-label">低碳出行</view>
			</view>
		</view>

		<!-- 常用功能 -->
		<view class="panel">
			<view class="panel-title">常用功能</view>
			<view class="panel-item" @click="goFav">
				<text class="panel-name">⭐ 我的收藏</text>
				<text class="arrow">›</text>
			</view>
			<view class="panel-item" @click="clearFav">
				<text class="panel-name">🗑 清空收藏</text>
				<text class="arrow">›</text>
			</view>
		</view>

		<!-- 关于 -->
		<view class="about">
			<view class="about-title">关于 CityWalk</view>
			<view class="about-text">一个用绿色出行探索城市文化的演示小程序</view>
			<view class="about-text">版本 v1.0.0</view>
		</view>
	</view>
</template>

<script>
	// 从公共数据文件导入路线数据（与首页、收藏页共用同一份）
	import { routes } from '../../common/data.js'

	export default {
		data() {
			return {
				// 路线数据：直接使用导入进来的数组
				routes,
				favCount: 0
			}
		},
		onShow() {
			// 每次进入「我的」页面都重新读收藏数量，保证是最新的
			const list = uni.getStorageSync('favList')
			this.favCount = Array.isArray(list) ? list.length : 0
		},
		methods: {
			// 跳转到收藏页（底部 tab 页面，用 switchTab）
			goFav() {
				uni.switchTab({ url: '/pages/fav/fav' })
			},
			// 清空所有收藏：先弹窗确认，再删除
			clearFav() {
				uni.showModal({
					title: '清空收藏',
					content: '确定要清空所有收藏的路线吗？',
					confirmText: '确定',
					confirmColor: '#1d7a4a',
					success: (res) => {
						if (res.confirm) {
							uni.removeStorageSync('favList')
							this.favCount = 0
							uni.showToast({ title: '已清空收藏', icon: 'none' })
						}
					}
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

	/* 个人信息卡 */
	.profile {
		display: flex;
		align-items: center;
		gap: 30rpx;
		background: linear-gradient(135deg, #1d7a4a 0%, #3fbf7f 100%);
		border-radius: 28rpx;
		padding: 40rpx;
		margin-bottom: 30rpx;
	}

	.avatar {
		width: 120rpx;
		height: 120rpx;
		line-height: 120rpx;
		text-align: center;
		font-size: 60rpx;
		background: rgba(255, 255, 255, 0.25);
		border-radius: 100rpx;
	}

	.profile-name {
		font-size: 40rpx;
		font-weight: bold;
		color: #ffffff;
	}

	.profile-desc {
		margin-top: 12rpx;
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.85);
	}

	/* 统计卡片 */
	.stats {
		display: flex;
		background: #ffffff;
		border-radius: 28rpx;
		padding: 36rpx 0;
		margin-bottom: 30rpx;
		box-shadow: 0 6rpx 24rpx rgba(29, 122, 74, 0.08);
	}

	.stat {
		flex: 1;
		text-align: center;
	}

	.stat-num {
		font-size: 48rpx;
		font-weight: bold;
		color: #1d7a4a;
	}

	.stat-label {
		margin-top: 10rpx;
		font-size: 24rpx;
		color: #8a978f;
	}

	/* 常用功能面板 */
	.panel {
		background: #ffffff;
		border-radius: 28rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 6rpx 24rpx rgba(29, 122, 74, 0.08);
	}

	.panel-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #23463a;
		margin-bottom: 10rpx;
	}

	.panel-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 28rpx 0;
		border-top: 2rpx solid #f0f4f1;
	}

	.panel-item:first-of-type {
		border-top: none;
	}

	.panel-name {
		font-size: 30rpx;
		color: #33463c;
	}

	.arrow {
		font-size: 40rpx;
		color: #c2ccc6;
	}

	/* 关于 */
	.about {
		text-align: center;
		padding-top: 10rpx;
	}

	.about-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #4a635a;
		margin-bottom: 14rpx;
	}

	.about-text {
		font-size: 24rpx;
		color: #9aa8a0;
		line-height: 1.8;
	}
</style>
