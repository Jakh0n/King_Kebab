'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { register } from '@/lib/api'
import { BikeIcon, Calendar, Clock, Loader2, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

export default function RegisterPage() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [employeeId, setEmployeeId] = useState('')
	const [jobType, setJobType] = useState<'rider' | 'worker'>('worker')
	const [paymentType, setPaymentType] = useState<'hourly' | 'monthly'>('hourly')
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	// Combine job type and payment type for backend compatibility
	const getPosition = () => {
		if (paymentType === 'monthly') {
			return 'rider' // Monthly workers use rider position for monthly dashboard
		} else {
			return 'worker' // Hourly workers use worker position for hourly dashboard
		}
	}

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setIsLoading(true)
		try {
			const position = getPosition()
			const response = await register(username, password, position, employeeId)
			localStorage.setItem('token', response.token)
			localStorage.setItem('position', response.position)
			localStorage.setItem('employeeId', response.employeeId)
			localStorage.setItem('jobType', jobType)
			localStorage.setItem('paymentType', paymentType)

			// Success toast
			toast.success('Successfully registered!', {
				description: `Welcome to King Kebab, ${username}!`,
				duration: 3000,
			})

			// Redirect based on payment type
			if (paymentType === 'monthly') {
				router.push('/monthly-dashboard')
			} else {
				router.push('/dashboard')
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Registration failed')
			toast.error('Registration failed', {
				description:
					err instanceof Error ? err.message : 'Something went wrong',
				duration: 3000,
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<main className='flex min-h-screen items-center justify-center p-4 bg-gray-50'>
			<Card className='w-full max-w-md'>
				<CardHeader>
					<Image
						src='/image.png'
						alt='King Kebab Logo'
						className='w-24 h-24 object-contain mb-4 mx-auto'
						width={100}
						height={100}
					/>
					<CardTitle className='text-2xl text-center'>Register</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='username'>Username</Label>
							<Input
								id='username'
								placeholder='Enter username'
								value={username}
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									setUsername(e.target.value)
								}
								required
								disabled={isLoading}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								type='password'
								placeholder='Enter password'
								value={password}
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									setPassword(e.target.value)
								}
								required
								disabled={isLoading}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='employeeId'>Employee ID</Label>
							<Input
								id='employeeId'
								placeholder='Enter employee ID'
								value={employeeId}
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									setEmployeeId(e.target.value)
								}
								required
								disabled={isLoading}
							/>
						</div>

						{/* Job Type Selection */}
						<div className='space-y-2'>
							<Label>Job Type</Label>
							<div className='grid grid-cols-2 gap-2'>
								<label
									className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
										jobType === 'worker'
											? 'border-blue-500 bg-blue-50'
											: 'border-gray-200 hover:bg-gray-50'
									}`}
								>
									<input
										type='radio'
										name='jobType'
										value='worker'
										checked={jobType === 'worker'}
										onChange={e =>
											setJobType(e.target.value as 'rider' | 'worker')
										}
										className='sr-only'
										disabled={isLoading}
									/>
									<User
										className={`w-6 h-6 mb-2 ${
											jobType === 'worker' ? 'text-blue-600' : 'text-gray-400'
										}`}
									/>
									<span
										className={`text-sm font-medium ${
											jobType === 'worker' ? 'text-blue-900' : 'text-gray-700'
										}`}
									>
										Worker
									</span>
									<span className='text-xs text-gray-500 text-center mt-1'>
										Kitchen & Operations
									</span>
								</label>
								<label
									className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
										jobType === 'rider'
											? 'border-green-500 bg-green-50'
											: 'border-gray-200 hover:bg-gray-50'
									}`}
								>
									<input
										type='radio'
										name='jobType'
										value='rider'
										checked={jobType === 'rider'}
										onChange={e =>
											setJobType(e.target.value as 'rider' | 'worker')
										}
										className='sr-only'
										disabled={isLoading}
									/>
									<BikeIcon
										className={`w-6 h-6 mb-2 ${
											jobType === 'rider' ? 'text-green-600' : 'text-gray-400'
										}`}
									/>
									<span
										className={`text-sm font-medium ${
											jobType === 'rider' ? 'text-green-900' : 'text-gray-700'
										}`}
									>
										Rider
									</span>
									<span className='text-xs text-gray-500 text-center mt-1'>
										Delivery & Service
									</span>
								</label>
							</div>
						</div>

						{/* Payment Type Selection */}
						<div className='space-y-2'>
							<Label>Payment Type</Label>
							<div className='grid grid-cols-2 gap-2'>
								<label
									className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
										paymentType === 'hourly'
											? 'border-blue-500 bg-blue-50'
											: 'border-gray-200 hover:bg-gray-50'
									}`}
								>
									<input
										type='radio'
										name='paymentType'
										value='hourly'
										checked={paymentType === 'hourly'}
										onChange={e =>
											setPaymentType(e.target.value as 'hourly' | 'monthly')
										}
										className='sr-only'
										disabled={isLoading}
									/>
									<Clock
										className={`w-6 h-6 mb-2 ${
											paymentType === 'hourly'
												? 'text-blue-600'
												: 'text-gray-400'
										}`}
									/>
									<span
										className={`text-sm font-medium ${
											paymentType === 'hourly'
												? 'text-blue-900'
												: 'text-gray-700'
										}`}
									>
										Hourly
									</span>
									<span className='text-xs text-gray-500 text-center mt-1'>
										Track Time
									</span>
								</label>
								<label
									className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
										paymentType === 'monthly'
											? 'border-green-500 bg-green-50'
											: 'border-gray-200 hover:bg-gray-50'
									}`}
								>
									<input
										type='radio'
										name='paymentType'
										value='monthly'
										checked={paymentType === 'monthly'}
										onChange={e =>
											setPaymentType(e.target.value as 'hourly' | 'monthly')
										}
										className='sr-only'
										disabled={isLoading}
									/>
									<Calendar
										className={`w-6 h-6 mb-2 ${
											paymentType === 'monthly'
												? 'text-green-600'
												: 'text-gray-400'
										}`}
									/>
									<span
										className={`text-sm font-medium ${
											paymentType === 'monthly'
												? 'text-green-900'
												: 'text-gray-700'
										}`}
									>
										Monthly
									</span>
									<span className='text-xs text-gray-500 text-center mt-1'>
										Fixed Salary
									</span>
								</label>
							</div>
						</div>

						{error && <p className='text-red-500 text-sm'>{error}</p>}
						<Button type='submit' className='w-full' disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Registering...
								</>
							) : (
								'Register'
							)}
						</Button>
						<p className='text-center text-sm text-gray-500'>
							Already have an account?{' '}
							<Link href='/login' className='text-blue-600 hover:underline'>
								Login
							</Link>
						</p>
					</form>
				</CardContent>
			</Card>
		</main>
	)
}
