'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { logout } from '@/lib/api'
import {
	Calendar,
	CalendarDays,
	CheckCircle2,
	FileText,
	LogOut,
	Sparkles,
	User,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner'

export default function MonthlyDashboardPage() {
	const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
	const [userData, setUserData] = useState<{
		id: string
		username: string
		position: string
		employeeId?: string
	} | null>(null)
	const router = useRouter()
	const [logoutLoading, setLogoutLoading] = useState(false)
	const [expandedAnnouncements, setExpandedAnnouncements] = useState<{
		[key: string]: boolean
	}>({})
	const [showBetaModal, setShowBetaModal] = useState(true)

	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	]

	const years = Array.from(
		{ length: 10 },
		(_, i) => new Date().getFullYear() - 5 + i
	)

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) {
			router.push('/login')
			return
		}

		const payload = JSON.parse(atob(token.split('.')[1]))

		// Redirect hourly workers to regular dashboard
		if (payload.position === 'worker') {
			router.push('/dashboard')
			return
		}

		setUserData({
			id: payload.userId,
			username: payload.username,
			position: payload.position,
			employeeId: payload.employeeId,
		})
	}, [router])

	const handleLogout = useCallback(async () => {
		try {
			setLogoutLoading(true)
			toast.info('Logging out...', {
				description: 'Please wait while we log you out safely.',
				duration: 2000,
			})

			// Add a small delay to show the loading state
			await new Promise(resolve => setTimeout(resolve, 1000))

			await logout()

			// Clear all local storage data
			localStorage.removeItem('token')
			localStorage.removeItem('position')
			localStorage.removeItem('employeeId')

			router.push('/login')
		} catch (error) {
			console.error('Logout error:', error)
			toast.error('Error logging out. Please try again.')
		} finally {
			setLogoutLoading(false)
		}
	}, [router])

	const toggleAnnouncement = (id: string) => {
		setExpandedAnnouncements(prev => ({
			...prev,
			[id]: !prev[id],
		}))
	}

	// Mock announcements for monthly workers
	const announcements = [
		{
			_id: '1',
			title: 'Monthly Schedule Update',
			content: 'Please check your monthly delivery schedule for any updates.',
			priority: 'high' as const,
			createdAt: new Date().toISOString(),
		},
		{
			_id: '2',
			title: 'Safety Reminder',
			content: 'Remember to always wear your safety gear during deliveries.',
			priority: 'medium' as const,
			createdAt: new Date().toISOString(),
		},
	]

	return (
		<div className='min-h-screen bg-[#0A0F1C] text-white p-2 sm:p-4'>
			<Toaster position='top-right' />

			{/* Beta Modal */}
			<Dialog open={showBetaModal} onOpenChange={setShowBetaModal}>
				<DialogContent className='bg-[#0E1422] text-white border-none max-w-md'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2 text-xl'>
							<Sparkles className='w-6 h-6 text-yellow-400' />
							Monthly Dashboard
						</DialogTitle>
						<DialogDescription className='text-gray-300 text-base leading-relaxed'>
							Welcome to your monthly dashboard! This is designed specifically
							for monthly workers with features tailored to your work schedule.
						</DialogDescription>
					</DialogHeader>
					<div className='flex justify-end mt-4'>
						<Button
							onClick={() => setShowBetaModal(false)}
							className='bg-[#4E7BEE] hover:bg-[#4E7BEE]/90'
						>
							Got it!
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<div className='max-w-4xl mx-auto space-y-3 sm:space-y-6'>
				{/* Header */}
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 bg-[#0E1422] p-3 sm:p-4 rounded-lg'>
					<div className='flex items-center gap-4'>
						<Image
							src='/cropped-kinglogo.avif'
							alt='King Kebab Logo'
							className='w-12 h-12 object-contain'
							width={100}
							height={100}
						/>
						<div>
							<h1 className='text-lg sm:text-2xl font-bold text-white'>
								Monthly Dashboard
							</h1>
							{userData && (
								<div className='flex items-center gap-2'>
									<p className='text-sm sm:text-base text-gray-400'>
										{userData.username}
									</p>
									<span className='px-2 py-0.5 bg-[#9B5DE5]/10 text-[#9B5DE5] text-xs rounded-full border border-[#9B5DE5]/20'>
										ID: {userData.employeeId || 'N/A'}
									</span>
									<span className='text-sm sm:text-base text-gray-400'>
										-{' '}
										{userData.position === 'rider' ? 'Rider' : 'Monthly Worker'}
									</span>
								</div>
							)}
						</div>
					</div>
					<div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
						<Button
							onClick={() => router.push('/monthly-dashboard/profile')}
							variant='outline'
							className='bg-transparent border-[#4E7BEE] text-[#4E7BEE] hover:bg-[#4E7BEE] hover:text-white w-full sm:w-auto'
						>
							<User className='w-4 h-4 mr-2' />
							Profile
						</Button>
						<Button
							onClick={handleLogout}
							variant='outline'
							className='bg-transparent border-red-500 text-red-500 hover:bg-red-500 hover:text-white w-full sm:w-auto'
							disabled={logoutLoading}
						>
							<LogOut className='w-4 h-4 mr-2' />
							{logoutLoading ? 'Logging out...' : 'Logout'}
						</Button>
					</div>
				</div>

				{/* Month/Year Selection */}
				<div className='bg-[#0E1422] p-3 sm:p-4 rounded-lg'>
					<div className='flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center'>
						<div className='flex items-center gap-2'>
							<CalendarDays className='w-5 h-5 text-[#4E7BEE]' />
							<span className='text-sm sm:text-base font-medium'>
								View Period:
							</span>
						</div>
						<div className='flex gap-2 w-full sm:w-auto'>
							<select
								value={selectedMonth}
								onChange={e => setSelectedMonth(Number(e.target.value))}
								className='bg-[#1A1F2E] text-white px-3 py-2 rounded border-none text-sm flex-1 sm:flex-none'
							>
								{months.map((month, index) => (
									<option key={month} value={index + 1}>
										{month}
									</option>
								))}
							</select>
							<select
								value={selectedYear}
								onChange={e => setSelectedYear(Number(e.target.value))}
								className='bg-[#1A1F2E] text-white px-3 py-2 rounded border-none text-sm flex-1 sm:flex-none'
							>
								{years.map(year => (
									<option key={year} value={year}>
										{year}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{/* Monthly Summary Cards */}
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
					<Card className='bg-[#0E1422] border-none text-white p-4 hover:bg-[#1A1F2E] transition-all duration-300'>
						<div className='flex items-center gap-3'>
							<div className='bg-[#9B5DE5]/10 p-3 rounded-xl'>
								<Calendar className='w-6 h-6 text-[#9B5DE5]' />
							</div>
							<div className='flex-1'>
								<h3 className='text-gray-400 text-sm mb-1'>Current Month</h3>
								<p className='text-2xl font-bold text-[#9B5DE5]'>
									{months[selectedMonth - 1]}
								</p>
							</div>
						</div>
					</Card>

					<Card className='bg-[#0E1422] border-none text-white p-4 hover:bg-[#1A1F2E] transition-all duration-300'>
						<div className='flex items-center gap-3'>
							<div className='bg-[#4CC4C0]/10 p-3 rounded-xl'>
								<CheckCircle2 className='w-6 h-6 text-[#4CC4C0]' />
							</div>
							<div className='flex-1'>
								<h3 className='text-gray-400 text-sm mb-1'>Status</h3>
								<p className='text-2xl font-bold text-[#4CC4C0]'>Active</p>
							</div>
						</div>
					</Card>

					<Card className='bg-[#0E1422] border-none text-white p-4 hover:bg-[#1A1F2E] transition-all duration-300'>
						<div className='flex items-center gap-3'>
							<div className='bg-[#4E7BEE]/10 p-3 rounded-xl'>
								<FileText className='w-6 h-6 text-[#4E7BEE]' />
							</div>
							<div className='flex-1'>
								<h3 className='text-gray-400 text-sm mb-1'>Position</h3>
								<p className='text-2xl font-bold text-[#4E7BEE]'>
									{userData?.position === 'rider' ? 'Rider' : 'Monthly Worker'}
								</p>
							</div>
						</div>
					</Card>
				</div>

				{/* Announcements Section */}
				<div className='bg-[#0E1422] p-4 rounded-lg'>
					<h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
						<FileText className='w-5 h-5 text-[#4E7BEE]' />
						Announcements
					</h2>
					<div className='space-y-3'>
						{announcements.length > 0 ? (
							announcements.map(announcement => (
								<Card
									key={announcement._id}
									className='bg-[#1A1F2E] border-none text-white p-4 cursor-pointer hover:bg-[#252B3E] transition-all duration-300'
									onClick={() => toggleAnnouncement(announcement._id)}
								>
									<div className='flex justify-between items-start mb-2'>
										<h3 className='font-semibold text-base flex items-center gap-2'>
											<div
												className={`w-3 h-3 rounded-full ${
													announcement.priority === 'high'
														? 'bg-red-500'
														: announcement.priority === 'medium'
														? 'bg-yellow-500'
														: 'bg-green-500'
												}`}
											/>
											{announcement.title}
										</h3>
										<span className='text-xs text-gray-400'>
											{new Date(announcement.createdAt).toLocaleDateString()}
										</span>
									</div>
									<p
										className={`text-gray-300 text-sm transition-all duration-300 ${
											expandedAnnouncements[announcement._id]
												? 'line-clamp-none'
												: 'line-clamp-2'
										}`}
									>
										{announcement.content}
									</p>
									{announcement.content.length > 100 && (
										<button className='text-[#4E7BEE] text-xs mt-2 hover:underline'>
											{expandedAnnouncements[announcement._id]
												? 'Show less'
												: 'Show more'}
										</button>
									)}
								</Card>
							))
						) : (
							<div className='text-center py-8 text-gray-400'>
								<FileText className='w-12 h-12 mx-auto mb-3 opacity-50' />
								<p>No announcements available</p>
							</div>
						)}
					</div>
				</div>

				{/* Monthly Information Section */}
				<div className='bg-[#0E1422] p-4 rounded-lg'>
					<h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
						<Calendar className='w-5 h-5 text-[#9B5DE5]' />
						Monthly Information
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<Card className='bg-[#1A1F2E] border-none text-white p-4'>
							<h3 className='font-semibold mb-2 text-[#9B5DE5]'>
								Work Schedule
							</h3>
							<p className='text-gray-300 text-sm'>
								Your monthly work schedule and delivery routes will be updated
								here. Check regularly for any changes or updates.
							</p>
						</Card>
						<Card className='bg-[#1A1F2E] border-none text-white p-4'>
							<h3 className='font-semibold mb-2 text-[#4CC4C0]'>Performance</h3>
							<p className='text-gray-300 text-sm'>
								Monthly performance metrics and feedback will be displayed here.
								Keep up the great work!
							</p>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
