'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	checkIn,
	checkOut,
	getBranchesNearby,
	getOpenTimeEntry,
} from '@/lib/api'
import type { BranchNearby, TimeEntry } from '@/types'
import { MapPin, Loader2, LogIn, LogOut } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export function CheckInOutCard({
	onCheckIn,
	onCheckOut,
}: {
	onCheckIn?: () => void
	onCheckOut?: () => void
}) {
	const [openEntry, setOpenEntry] = useState<TimeEntry | null>(null)
	const [nearby, setNearby] = useState<BranchNearby[]>([])
	const [loadingOpen, setLoadingOpen] = useState(true)
	const [loadingNearby, setLoadingNearby] = useState(false)
	const [locationError, setLocationError] = useState<string | null>(null)
	const [checkInLoading, setCheckInLoading] = useState<string | null>(null)
	const [checkOutLoading, setCheckOutLoading] = useState(false)

	const fetchOpenEntry = useCallback(async () => {
		try {
			const entry = await getOpenTimeEntry()
			setOpenEntry(entry ?? null)
		} catch {
			setOpenEntry(null)
		} finally {
			setLoadingOpen(false)
		}
	}, [])

	useEffect(() => {
		fetchOpenEntry()
	}, [fetchOpenEntry])

	const getLocationAndNearby = useCallback(() => {
		setLocationError(null)
		setNearby([])
		setLoadingNearby(true)
		if (!navigator.geolocation) {
			setLocationError('Geolocation is not supported by your browser.')
			setLoadingNearby(false)
			return
		}
		navigator.geolocation.getCurrentPosition(
			async (position) => {
				try {
					const { latitude, longitude } = position.coords
					const branches = await getBranchesNearby(latitude, longitude)
					setNearby(branches)
					if (branches.length === 0) {
						toast.info('No branch nearby', {
							description: 'You must be within the check-in area of a branch.',
						})
					}
				} catch (err) {
					toast.error(
						err instanceof Error ? err.message : 'Failed to load nearby branches'
					)
				} finally {
					setLoadingNearby(false)
				}
			},
			(err) => {
				const msg =
					err.code === 1
						? 'Location permission denied.'
						: err.code === 2
							? 'Location unavailable.'
							: 'Failed to get location.'
				setLocationError(msg)
				setLoadingNearby(false)
				toast.error(msg)
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
		)
	}, [])

	const handleCheckIn = useCallback(
		async (branchId: string) => {
			setCheckInLoading(branchId)
			setLocationError(null)
			if (!navigator.geolocation) {
				toast.error('Geolocation is not supported.')
				setCheckInLoading(null)
				return
			}
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					try {
						const { latitude, longitude } = position.coords
						await checkIn(branchId, latitude, longitude)
						setOpenEntry(await getOpenTimeEntry())
						setNearby([])
						onCheckIn?.()
						toast.success('Checked in successfully')
					} catch (err) {
						toast.error(
							err instanceof Error ? err.message : 'Check-in failed'
						)
					} finally {
						setCheckInLoading(null)
					}
				},
				() => {
					toast.error('Could not get location. Please allow location access.')
					setCheckInLoading(null)
				},
				{ enableHighAccuracy: true, timeout: 10000 }
			)
		},
		[onCheckIn]
	)

	const handleCheckOut = useCallback(async () => {
		setCheckOutLoading(true)
		try {
			const updated = await checkOut()
			setOpenEntry(null)
			onCheckOut?.()
			toast.success(
				`Checked out. ${updated.hours > 0 ? `${updated.hours}h recorded.` : ''}`
			)
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Check-out failed')
		} finally {
			setCheckOutLoading(false)
		}
	}, [onCheckOut])

	const branchName =
		openEntry?.branch && typeof openEntry.branch === 'object'
			? openEntry.branch.name
			: null
	const startTimeStr = openEntry?.startTime
		? new Date(openEntry.startTime).toLocaleTimeString('en-GB', {
				hour: '2-digit',
				minute: '2-digit',
		  })
		: ''

	if (loadingOpen) {
		return (
			<Card className="bg-[#1A1F2E] border-[#2D3548]">
				<CardContent className="p-4 flex items-center justify-center gap-2">
					<Loader2 className="h-5 w-5 animate-spin text-[#4E7BEE]" />
					<span className="text-gray-400">Loading...</span>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="bg-[#1A1F2E] border-[#2D3548]">
			<CardHeader className="pb-2">
				<CardTitle className="text-base font-semibold text-white flex items-center gap-2">
					<MapPin className="h-4 w-4 text-[#4E7BEE]" />
					Branch check-in
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{openEntry ? (
					<>
						<div className="text-sm text-gray-300">
							Checked in at <strong className="text-white">{branchName}</strong>
							{startTimeStr && ` since ${startTimeStr}`}.
						</div>
						<Button
							onClick={handleCheckOut}
							disabled={checkOutLoading}
							className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white"
						>
							{checkOutLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<>
									<LogOut className="h-4 w-4 mr-2" />
									Check out
								</>
							)}
						</Button>
					</>
				) : (
					<>
						{locationError && (
							<p className="text-sm text-amber-500">{locationError}</p>
						)}
						{nearby.length === 0 && !loadingNearby && (
							<p className="text-sm text-gray-400">
								Get your location to see branches you can check in at.
							</p>
						)}
						<Button
							onClick={getLocationAndNearby}
							disabled={loadingNearby}
							variant="outline"
							className="border-[#2D3548] text-gray-300 hover:bg-[#2D3548]"
						>
							{loadingNearby ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<MapPin className="h-4 w-4 mr-2" />
							)}
							{loadingNearby ? 'Finding branches...' : 'Find nearby branches'}
						</Button>
						{nearby.length > 0 && (
							<div className="space-y-2 pt-1">
								<p className="text-sm text-gray-400">You can check in at:</p>
								<ul className="space-y-2">
									{nearby.map((b) => (
										<li
											key={b._id}
											className="flex items-center justify-between gap-2 rounded-lg bg-[#0E1422] p-2"
										>
											<span className="text-sm text-white">
												{b.name} <span className="text-gray-500">({b.distance}m)</span>
											</span>
											<Button
												size="sm"
												onClick={() => handleCheckIn(b._id)}
												disabled={checkInLoading !== null}
												className="bg-[#4E7BEE] hover:bg-[#4E7BEE]/90"
											>
												{checkInLoading === b._id ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<>
														<LogIn className="h-3 w-3 mr-1" />
														Check in
													</>
												)}
											</Button>
										</li>
									))}
								</ul>
							</div>
						)}
					</>
				)}
			</CardContent>
		</Card>
	)
}
