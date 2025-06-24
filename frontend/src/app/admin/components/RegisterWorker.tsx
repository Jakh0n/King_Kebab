'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { registerWorker } from '@/lib/api'
import { Calendar, Clock, Loader2, Truck, User } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function RegisterWorker() {
	const [formData, setFormData] = useState({
		username: '',
		password: '',
		jobType: 'worker',
		paymentType: 'hourly',
		isAdmin: false,
		employeeId: '',
	})
	const [isLoading, setIsLoading] = useState(false)

	// Combine job type and payment type for backend compatibility
	const getPosition = () => {
		if (formData.paymentType === 'monthly') {
			return 'rider' // Monthly workers use rider position for monthly dashboard
		} else {
			return 'worker' // Hourly workers use worker position for hourly dashboard
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setIsLoading(true)

		try {
			if (!formData.username || !formData.password || !formData.employeeId) {
				throw new Error('Please fill in all fields')
			}

			const position = getPosition()
			await registerWorker({
				...formData,
				position,
			})
			toast.success('Worker registered successfully')

			// Reset form
			setFormData({
				username: '',
				password: '',
				jobType: 'worker',
				paymentType: 'hourly',
				isAdmin: false,
				employeeId: '',
			})
		} catch (error) {
			console.error('Registration error:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to register worker'
			)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Card className='w-full max-w-lg bg-[#0E1422] text-white border-none'>
			<CardHeader>
				<CardTitle className='text-xl font-semibold'>
					Register New Worker
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='username'>Username</Label>
						<Input
							id='username'
							value={formData.username}
							onChange={e =>
								setFormData({ ...formData, username: e.target.value })
							}
							className='bg-[#1A1F2E] border-none text-white'
							placeholder='Enter username'
							disabled={isLoading}
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='password'>Password</Label>
						<Input
							id='password'
							type='password'
							value={formData.password}
							onChange={e =>
								setFormData({ ...formData, password: e.target.value })
							}
							className='bg-[#1A1F2E] border-none text-white'
							placeholder='Enter password'
							disabled={isLoading}
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='employeeId'>Employee ID</Label>
						<Input
							id='employeeId'
							value={formData.employeeId}
							onChange={e =>
								setFormData({ ...formData, employeeId: e.target.value })
							}
							className='bg-[#1A1F2E] border-none text-white'
							placeholder='Enter employee ID'
							disabled={isLoading}
						/>
					</div>
					<div className='space-y-2'>
						<Label>Job Type</Label>
						<Select
							value={formData.jobType}
							onValueChange={value =>
								setFormData({ ...formData, jobType: value })
							}
							disabled={isLoading}
						>
							<SelectTrigger className='bg-[#1A1F2E] border-none text-white'>
								<SelectValue placeholder='Select job type' />
							</SelectTrigger>
							<SelectContent className='bg-[#1A1F2E] text-white border-none'>
								<SelectItem value='worker'>
									<div className='flex items-center gap-2'>
										<User className='w-4 h-4 text-blue-400' />
										<span>Worker</span>
									</div>
								</SelectItem>
								<SelectItem value='rider'>
									<div className='flex items-center gap-2'>
										<Truck className='w-4 h-4 text-green-400' />
										<span>Rider</span>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className='space-y-2'>
						<Label>Payment Type</Label>
						<Select
							value={formData.paymentType}
							onValueChange={value =>
								setFormData({ ...formData, paymentType: value })
							}
							disabled={isLoading}
						>
							<SelectTrigger className='bg-[#1A1F2E] border-none text-white'>
								<SelectValue placeholder='Select payment type' />
							</SelectTrigger>
							<SelectContent className='bg-[#1A1F2E] text-white border-none'>
								<SelectItem value='hourly'>
									<div className='flex items-center gap-2'>
										<Clock className='w-4 h-4 text-blue-400' />
										<span>Hourly</span>
									</div>
								</SelectItem>
								<SelectItem value='monthly'>
									<div className='flex items-center gap-2'>
										<Calendar className='w-4 h-4 text-green-400' />
										<span>Monthly</span>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Selection Summary */}
					<div className='p-3 bg-[#1A1F2E] rounded-lg border border-gray-700'>
						<p className='text-sm font-medium text-gray-300'>
							Selected: {formData.jobType === 'rider' ? 'Rider' : 'Worker'} -{' '}
							{formData.paymentType === 'hourly' ? 'Hourly' : 'Monthly'} Pay
						</p>
						<p className='text-xs text-gray-500 mt-1'>
							Will access the{' '}
							{formData.paymentType === 'monthly' ? 'monthly' : 'hourly'}{' '}
							dashboard.
						</p>
					</div>

					<div className='flex items-center space-x-2'>
						<Checkbox
							id='isAdmin'
							checked={formData.isAdmin}
							onCheckedChange={checked =>
								setFormData({ ...formData, isAdmin: checked as boolean })
							}
							className='border-white data-[state=checked]:bg-[#4E7BEE] data-[state=checked]:border-[#4E7BEE]'
							disabled={isLoading}
						/>
						<Label htmlFor='isAdmin' className='text-sm font-normal'>
							Make admin
						</Label>
					</div>
					<Button
						type='submit'
						className='w-full bg-[#4E7BEE] hover:bg-[#4E7BEE]/90'
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Registering...
							</>
						) : (
							'Register Worker'
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
