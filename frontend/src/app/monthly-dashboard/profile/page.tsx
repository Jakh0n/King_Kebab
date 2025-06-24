'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getUserProfile, updateUserProfile } from '@/lib/api'
import { User } from '@/types'
import {
	ArrowLeft,
	Award,
	Briefcase,
	Calendar,
	Camera,
	FileText,
	Image as ImageIcon,
	Mail,
	Pencil,
	Phone,
	Shield,
	Star,
	Upload,
	User as UserIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export default function MonthlyUserProfile() {
	const router = useRouter()
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const [isEditing, setIsEditing] = useState(false)
	const [uploading, setUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const cameraInputRef = useRef<HTMLInputElement>(null)
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		bio: '',
		department: '',
		photoUrl: '',
		hireDate: '',
		skills: [] as string[],
		emergencyContact: {
			name: '',
			phone: '',
			relationship: '',
		},
	})

	// Fallback base64 image upload for when UploadThing is not available
	const handleFallbackImageUpload = (file: File) => {
		console.log('Using fallback base64 upload method')
		setUploading(true)

		const reader = new FileReader()
		reader.onload = e => {
			const base64Image = e.target?.result as string
			console.log('Base64 image created for immediate preview')

			// Update form data with base64 for immediate display
			setFormData(prev => ({
				...prev,
				photoUrl: base64Image,
			}))

			// Update user state for immediate display
			setUser(prev =>
				prev
					? {
							...prev,
							photoUrl: base64Image,
					  }
					: null
			)

			// Save base64 image to localStorage for persistence
			if (user?._id) {
				const savedImageKey = `userImage_${user._id}`
				const userProfileKey = `userProfile_${user._id}`
				localStorage.setItem(savedImageKey, base64Image)

				const currentProfile = JSON.parse(
					localStorage.getItem(userProfileKey) || '{}'
				)
				localStorage.setItem(
					userProfileKey,
					JSON.stringify({
						...currentProfile,
						photoUrl: base64Image,
					})
				)
				console.log('Base64 image saved to localStorage')
			}

			toast.success('Photo uploaded successfully! 📸', {
				description: 'Your profile picture has been updated.',
				duration: 3000,
			})
			setUploading(false)
		}

		reader.onerror = () => {
			console.error('Failed to read file')
			toast.error('Upload failed!', {
				description:
					'There was an error processing your image. Please try again.',
				duration: 4000,
			})
			setUploading(false)
		}

		reader.readAsDataURL(file)
	}

	useEffect(() => {
		fetchUserProfile()
	}, [])

	const fetchUserProfile = async () => {
		try {
			console.log('Loading user profile from token...')
			const token = localStorage.getItem('token')
			console.log('Token exists:', !!token)

			if (!token) {
				console.log('No token found, redirecting to login')
				router.push('/login')
				return
			}

			// Decode token to get user info
			const payload = JSON.parse(atob(token.split('.')[1]))
			console.log('Token payload:', payload)

			// Redirect hourly workers to regular dashboard profile
			if (payload.position === 'worker') {
				router.push('/dashboard/profile')
				return
			}

			// Check cache first
			const cacheKey = `userProfile_${payload.userId}`
			const cachedProfile = localStorage.getItem(cacheKey)

			if (cachedProfile) {
				console.log('Using cached profile data')
				const profileData = JSON.parse(cachedProfile)
				setUser(profileData)
				setFormData({
					name: profileData.name || '',
					email: profileData.email || '',
					phone: profileData.phone || '',
					bio: profileData.bio || '',
					department: profileData.department || '',
					photoUrl: profileData.photoUrl || '',
					hireDate: profileData.hireDate || '',
					skills: profileData.skills || [],
					emergencyContact: profileData.emergencyContact
						? {
								name: profileData.emergencyContact.name || '',
								phone: profileData.emergencyContact.phone || '',
								relationship: profileData.emergencyContact.relationship || '',
						  }
						: {
								name: '',
								phone: '',
								relationship: '',
						  },
				})
			}

			// Try to fetch fresh data
			try {
				console.log('Fetching fresh profile data from API...')
				const profileData = await getUserProfile()
				console.log('Fresh profile data received:', profileData)

				// Update cache
				localStorage.setItem(cacheKey, JSON.stringify(profileData))

				setUser(profileData)
				setFormData({
					name: profileData.name || '',
					email: profileData.email || '',
					phone: profileData.phone || '',
					bio: profileData.bio || '',
					department: profileData.department || '',
					photoUrl: profileData.photoUrl || '',
					hireDate: profileData.hireDate || '',
					skills: profileData.skills || [],
					emergencyContact: profileData.emergencyContact
						? {
								name: profileData.emergencyContact.name || '',
								phone: profileData.emergencyContact.phone || '',
								relationship: profileData.emergencyContact.relationship || '',
						  }
						: {
								name: '',
								phone: '',
								relationship: '',
						  },
				})
			} catch (apiError) {
				console.log('API call failed, using cached/token data:', apiError)
				// If API fails but we don't have cached data, create basic profile from token
				if (!cachedProfile) {
					const basicProfile = {
						_id: payload.userId,
						username: payload.username,
						position: payload.position,
						employeeId: payload.employeeId,
						name: '',
						email: '',
						phone: '',
						bio: '',
						department: '',
						photoUrl: '',
						hireDate: '',
						skills: [],
						emergencyContact: {
							name: '',
							phone: '',
							relationship: '',
						},
					}
					setUser(basicProfile)
					setFormData({
						name: '',
						email: '',
						phone: '',
						bio: '',
						department: '',
						photoUrl: '',
						hireDate: '',
						skills: [],
						emergencyContact: {
							name: '',
							phone: '',
							relationship: '',
						},
					})
				}
			}
		} catch (error) {
			console.error('Error in fetchUserProfile:', error)
			router.push('/login')
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		try {
			console.log('Updating profile with data:', formData)
			const updatedUser = await updateUserProfile(formData)
			console.log('Profile updated successfully:', updatedUser)

			setUser(updatedUser)
			setIsEditing(false)

			// Update cache
			if (updatedUser._id) {
				const cacheKey = `userProfile_${updatedUser._id}`
				localStorage.setItem(cacheKey, JSON.stringify(updatedUser))
			}

			toast.success('Profile updated successfully! ✨', {
				description: 'Your changes have been saved.',
				duration: 3000,
			})
		} catch (error) {
			console.error('Error updating profile:', error)
			toast.error('Update failed!', {
				description:
					error instanceof Error ? error.message : 'Something went wrong',
				duration: 4000,
			})
		}
	}

	const handleImageUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0]
		if (!file) return

		// Validate file type
		const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
		if (!validTypes.includes(file.type)) {
			toast.error('Invalid file type!', {
				description: 'Please upload a JPEG, PNG, or WebP image.',
				duration: 4000,
			})
			return
		}

		// Validate file size (5MB limit)
		const maxSize = 5 * 1024 * 1024 // 5MB in bytes
		if (file.size > maxSize) {
			toast.error('File too large!', {
				description: 'Please upload an image smaller than 5MB.',
				duration: 4000,
			})
			return
		}

		// Use fallback base64 upload
		handleFallbackImageUpload(file)
	}

	const triggerCameraCapture = () => {
		if (cameraInputRef.current) {
			cameraInputRef.current.click()
		}
	}

	const triggerGallerySelection = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click()
		}
	}

	const addSkill = (skill: string) => {
		if (skill && !formData.skills.includes(skill)) {
			setFormData(prev => ({
				...prev,
				skills: [...prev.skills, skill],
			}))
		}
	}

	const removeSkill = (skillToRemove: string) => {
		setFormData(prev => ({
			...prev,
			skills: prev.skills.filter(skill => skill !== skillToRemove),
		}))
	}

	const formatDate = (dateString?: string) => {
		if (!dateString) return 'Not set'
		try {
			return new Date(dateString).toLocaleDateString()
		} catch {
			return 'Invalid date'
		}
	}

	if (loading) {
		return (
			<div className='min-h-screen bg-[#0A0F1C] flex items-center justify-center'>
				<div className='text-white text-lg'>Loading profile...</div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className='min-h-screen bg-[#0A0F1C] flex items-center justify-center'>
				<div className='text-white text-lg'>User not found</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-[#0A0F1C] text-white'>
			{/* Header */}
			<div className='bg-[#0E1422] border-b border-gray-800'>
				<div className='max-w-6xl mx-auto px-4 sm:px-6 py-4'>
					<div className='flex items-center gap-2 sm:gap-4'>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => router.push('/monthly-dashboard')}
							className='text-gray-400 hover:text-white hover:bg-[#1A1F2E] p-2 sm:px-3'
						>
							<ArrowLeft className='w-4 h-4 sm:mr-2' />
							<span className='hidden sm:inline'>Back to Dashboard</span>
						</Button>
						<div className='flex items-center gap-2 sm:gap-3'>
							<div className='w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
								<UserIcon className='w-3 h-3 sm:w-4 sm:h-4 text-white' />
							</div>
							<h1 className='text-lg sm:text-xl font-bold'>
								Monthly Worker Profile
							</h1>
						</div>
					</div>
				</div>
			</div>

			<div className='max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8'>
				<div className='grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-3'>
					{/* Left Column - Profile Card */}
					<div className='lg:col-span-1'>
						<Card className='bg-[#0E1422] border-none text-white lg:sticky lg:top-8'>
							<CardContent className='p-4 sm:p-6 lg:p-8'>
								<div className='text-center'>
									<div className='relative inline-block mb-4 sm:mb-6'>
										<Avatar className='w-24 h-24 sm:w-32 sm:h-32 border-4 border-blue-600/20'>
											<AvatarImage
												src={user.photoUrl || formData.photoUrl}
												alt={user.username}
												className='object-cover'
											/>
											<AvatarFallback className='bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl sm:text-2xl font-bold'>
												{user.username?.charAt(0)?.toUpperCase() || 'U'}
											</AvatarFallback>
										</Avatar>

										{/* Photo Upload Options */}
										<div className='absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2'>
											<Dialog>
												<DialogTrigger asChild>
													<Button
														size='sm'
														className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 hover:bg-blue-700 p-0'
													>
														<Camera className='w-3 h-3 sm:w-4 sm:h-4' />
													</Button>
												</DialogTrigger>
												<DialogContent className='bg-[#0E1422] text-white border-none max-w-sm mx-4'>
													<DialogHeader>
														<DialogTitle>Update Profile Photo</DialogTitle>
													</DialogHeader>
													<div className='space-y-4 pt-4'>
														<Button
															onClick={triggerCameraCapture}
															className='w-full bg-blue-600 hover:bg-blue-700'
															disabled={uploading}
														>
															<Camera className='w-4 h-4 mr-2' />
															Take Photo
														</Button>
														<Button
															onClick={triggerGallerySelection}
															variant='outline'
															className='w-full border-gray-600 text-white hover:bg-gray-800'
															disabled={uploading}
														>
															<ImageIcon className='w-4 h-4 mr-2' />
															Choose from Gallery
														</Button>
													</div>
												</DialogContent>
											</Dialog>
										</div>

										{/* Hidden file inputs */}
										<input
											ref={fileInputRef}
											type='file'
											accept='image/*'
											onChange={handleImageUpload}
											className='hidden'
										/>
										<input
											ref={cameraInputRef}
											type='file'
											accept='image/*'
											capture='environment'
											onChange={handleImageUpload}
											className='hidden'
										/>
									</div>

									<h2 className='text-xl sm:text-2xl font-bold mb-2'>
										{user.username}
									</h2>
									<Badge
										variant='secondary'
										className='mb-4 bg-purple-600/20 text-purple-300 border-purple-600/30 text-sm'
									>
										{user.position === 'rider' ? 'Rider' : 'Monthly Worker'}
									</Badge>

									<div className='space-y-2 sm:space-y-3 text-left'>
										<div className='flex items-center gap-3 p-3 bg-[#1A1F2E] rounded-lg'>
											<Shield className='w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0' />
											<div className='min-w-0 flex-1'>
												<p className='text-xs sm:text-sm text-gray-400'>
													Employee ID
												</p>
												<p className='font-medium text-sm sm:text-base truncate'>
													{user.employeeId}
												</p>
											</div>
										</div>

										<div className='flex items-center gap-3 p-3 bg-[#1A1F2E] rounded-lg'>
											<Calendar className='w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0' />
											<div className='min-w-0 flex-1'>
												<p className='text-xs sm:text-sm text-gray-400'>
													Hire Date
												</p>
												<p className='font-medium text-sm sm:text-base truncate'>
													{formatDate(user.hireDate)}
												</p>
											</div>
										</div>

										{user.department && (
											<div className='flex items-center gap-3 p-3 bg-[#1A1F2E] rounded-lg'>
												<Briefcase className='w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0' />
												<div className='min-w-0 flex-1'>
													<p className='text-xs sm:text-sm text-gray-400'>
														Department
													</p>
													<p className='font-medium text-sm sm:text-base truncate'>
														{user.department}
													</p>
												</div>
											</div>
										)}
									</div>

									<Button
										onClick={() => setIsEditing(true)}
										className='w-full mt-4 sm:mt-6 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base'
									>
										<Pencil className='w-4 h-4 mr-2' />
										Edit Profile
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right Column - Profile Details */}
					<div className='lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8'>
						{/* Personal Information */}
						<Card className='bg-[#0E1422] border-none text-white'>
							<CardHeader className='pb-4'>
								<CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
									<UserIcon className='w-4 h-4 sm:w-5 sm:h-5 text-blue-400' />
									Personal Information
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4 sm:space-y-6'>
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6'>
									<div className='group p-3 sm:p-4 bg-gradient-to-br from-blue-600/10 via-blue-600/5 to-transparent rounded-xl sm:rounded-2xl border border-blue-600/30 hover:border-blue-600/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm'>
										<div className='flex items-center justify-between mb-2 sm:mb-3'>
											<div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300'>
												<UserIcon className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
											</div>
										</div>
										<p className='text-xs sm:text-sm font-medium text-blue-300 mb-1 sm:mb-2'>
											👤 Full Name
										</p>
										<p className='text-base sm:text-lg font-bold text-white truncate'>
											{user.name || 'Not set'}
										</p>
									</div>

									<div className='group p-3 sm:p-4 bg-gradient-to-br from-green-600/10 via-green-600/5 to-transparent rounded-xl sm:rounded-2xl border border-green-600/30 hover:border-green-600/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm'>
										<div className='flex items-center justify-between mb-2 sm:mb-3'>
											<div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300'>
												<Mail className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
											</div>
										</div>
										<p className='text-xs sm:text-sm font-medium text-blue-300 mb-1 sm:mb-2'>
											📧 Email
										</p>
										<p className='text-base sm:text-lg font-bold text-white truncate'>
											{user.email || 'Not set'}
										</p>
									</div>

									<div className='group p-3 sm:p-4 bg-gradient-to-br from-yellow-600/10 via-yellow-600/5 to-transparent rounded-xl sm:rounded-2xl border border-yellow-600/30 hover:border-yellow-600/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm'>
										<div className='flex items-center justify-between mb-2 sm:mb-3'>
											<div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300'>
												<Phone className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
											</div>
										</div>
										<p className='text-xs sm:text-sm font-medium text-blue-300 mb-1 sm:mb-2'>
											📱 Phone
										</p>
										<p className='text-base sm:text-lg font-bold text-white truncate'>
											{user.phone || 'Not set'}
										</p>
									</div>

									<div className='group p-3 sm:p-4 bg-gradient-to-br from-indigo-600/10 via-indigo-600/5 to-transparent rounded-xl sm:rounded-2xl border border-indigo-600/30 hover:border-indigo-600/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm'>
										<div className='flex items-center justify-between mb-2 sm:mb-3'>
											<div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300'>
												<Award className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
											</div>
										</div>
										<p className='text-xs sm:text-sm font-medium text-blue-300 mb-1 sm:mb-2'>
											🆔 Employee ID
										</p>
										<p className='text-base sm:text-lg font-bold text-white truncate'>
											{user?.employeeId}
										</p>
									</div>

									<div className='group p-3 sm:p-4 bg-gradient-to-br from-purple-600/10 via-purple-600/5 to-transparent rounded-xl sm:rounded-2xl border border-purple-600/30 hover:border-purple-600/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm sm:col-span-2 lg:col-span-1'>
										<div className='flex items-center justify-between mb-2 sm:mb-3'>
											<div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300'>
												<Briefcase className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
											</div>
										</div>
										<p className='text-xs sm:text-sm font-medium text-blue-300 mb-1 sm:mb-2'>
											💼 Position
										</p>
										<p className='text-base sm:text-lg font-bold text-white capitalize truncate'>
											{user?.position}
										</p>
									</div>
								</div>

								{/* Bio Section */}
								{user.bio && (
									<div className='p-4 sm:p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl sm:rounded-2xl border border-gray-700/50'>
										<h3 className='text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2'>
											<FileText className='w-4 h-4 sm:w-5 sm:h-5 text-blue-400' />
											About Me
										</h3>
										<p className='text-sm sm:text-base text-gray-300 leading-relaxed'>
											{user.bio}
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Skills Section */}
						{user.skills && user.skills.length > 0 && (
							<Card className='bg-[#0E1422] border-none text-white'>
								<CardHeader className='pb-4'>
									<CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
										<Star className='w-4 h-4 sm:w-5 sm:h-5 text-yellow-400' />
										Skills & Expertise
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='flex flex-wrap gap-2'>
										{user.skills.map((skill, index) => (
											<Badge
												key={index}
												variant='secondary'
												className='bg-blue-600/20 text-blue-300 border-blue-600/30 px-2 sm:px-3 py-1 text-xs sm:text-sm'
											>
												{skill}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Emergency Contact */}
						{user.emergencyContact &&
							(user.emergencyContact.name ||
								user.emergencyContact.phone ||
								user.emergencyContact.relationship) && (
								<Card className='bg-[#0E1422] border-none text-white'>
									<CardHeader className='pb-4'>
										<CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
											<Phone className='w-4 h-4 sm:w-5 sm:h-5 text-red-400' />
											Emergency Contact
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
											{user.emergencyContact.name && (
												<div className='p-3 sm:p-4 bg-[#1A1F2E] rounded-lg'>
													<p className='text-xs sm:text-sm text-gray-400 mb-1'>
														Name
													</p>
													<p className='font-medium text-sm sm:text-base truncate'>
														{user.emergencyContact.name}
													</p>
												</div>
											)}
											{user.emergencyContact.phone && (
												<div className='p-3 sm:p-4 bg-[#1A1F2E] rounded-lg'>
													<p className='text-xs sm:text-sm text-gray-400 mb-1'>
														Phone
													</p>
													<p className='font-medium text-sm sm:text-base truncate'>
														{user.emergencyContact.phone}
													</p>
												</div>
											)}
											{user.emergencyContact.relationship && (
												<div className='p-3 sm:p-4 bg-[#1A1F2E] rounded-lg sm:col-span-2 lg:col-span-1'>
													<p className='text-xs sm:text-sm text-gray-400 mb-1'>
														Relationship
													</p>
													<p className='font-medium text-sm sm:text-base truncate'>
														{user.emergencyContact.relationship}
													</p>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							)}
					</div>
				</div>
			</div>

			{/* Edit Profile Modal */}
			<Dialog open={isEditing} onOpenChange={setIsEditing}>
				<DialogContent className='bg-[#0E1422] text-white border-none max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto'>
					<DialogHeader>
						<DialogTitle className='text-lg sm:text-xl font-bold'>
							Edit Profile
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className='space-y-4 sm:space-y-6 mt-4'>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
							<div>
								<Label htmlFor='name' className='text-sm'>
									Full Name
								</Label>
								<Input
									id='name'
									value={formData.name}
									onChange={e =>
										setFormData(prev => ({ ...prev, name: e.target.value }))
									}
									className='bg-[#1A1F2E] border-gray-600 text-white text-sm'
									placeholder='Enter your full name'
								/>
							</div>
							<div>
								<Label htmlFor='email' className='text-sm'>
									Email
								</Label>
								<Input
									id='email'
									type='email'
									value={formData.email}
									onChange={e =>
										setFormData(prev => ({ ...prev, email: e.target.value }))
									}
									className='bg-[#1A1F2E] border-gray-600 text-white text-sm'
									placeholder='Enter your email'
								/>
							</div>
							<div>
								<Label htmlFor='phone' className='text-sm'>
									Phone
								</Label>
								<Input
									id='phone'
									value={formData.phone}
									onChange={e =>
										setFormData(prev => ({ ...prev, phone: e.target.value }))
									}
									className='bg-[#1A1F2E] border-gray-600 text-white text-sm'
									placeholder='Enter your phone number'
								/>
							</div>
							<div>
								<Label htmlFor='department' className='text-sm'>
									Department
								</Label>
								<Input
									id='department'
									value={formData.department}
									onChange={e =>
										setFormData(prev => ({
											...prev,
											department: e.target.value,
										}))
									}
									className='bg-[#1A1F2E] border-gray-600 text-white text-sm'
									placeholder='Enter your department'
								/>
							</div>
						</div>

						<div className='sm:col-span-2'>
							<Label htmlFor='bio' className='text-sm'>
								Bio
							</Label>
							<Textarea
								id='bio'
								value={formData.bio}
								onChange={e =>
									setFormData(prev => ({ ...prev, bio: e.target.value }))
								}
								className='bg-[#1A1F2E] border-gray-600 text-white text-sm min-h-[80px] sm:min-h-[100px]'
								placeholder='Tell us about yourself...'
								maxLength={500}
							/>
							<p className='text-xs text-gray-400 mt-1'>
								{formData.bio.length}/500 characters
							</p>
						</div>

						{/* Skills Section */}
						<div className='sm:col-span-2'>
							<Label className='text-sm'>Skills</Label>
							<div className='space-y-2'>
								<div className='flex flex-wrap gap-1 sm:gap-2 mb-2'>
									{formData.skills.map((skill, index) => (
										<Badge
											key={index}
											variant='secondary'
											className='bg-blue-600/20 text-blue-300 border-blue-600/30 px-2 py-1 cursor-pointer text-xs sm:text-sm'
											onClick={() => removeSkill(skill)}
										>
											{skill} ×
										</Badge>
									))}
								</div>
								<Select onValueChange={addSkill}>
									<SelectTrigger className='bg-[#1A1F2E] border-gray-600 text-white text-sm'>
										<SelectValue placeholder='Add a skill' />
									</SelectTrigger>
									<SelectContent className='bg-[#1A1F2E] text-white border-gray-600'>
										<SelectItem value='Delivery'>Delivery</SelectItem>
										<SelectItem value='Customer Service'>
											Customer Service
										</SelectItem>
										<SelectItem value='Navigation'>Navigation</SelectItem>
										<SelectItem value='Time Management'>
											Time Management
										</SelectItem>
										<SelectItem value='Communication'>Communication</SelectItem>
										<SelectItem value='Problem Solving'>
											Problem Solving
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Emergency Contact */}
						<div className='space-y-3 sm:space-y-4 sm:col-span-2'>
							<Label className='text-sm sm:text-base font-semibold'>
								Emergency Contact
							</Label>
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
								<div>
									<Label htmlFor='emergencyName' className='text-sm'>
										Name
									</Label>
									<Input
										id='emergencyName'
										value={formData.emergencyContact.name}
										onChange={e =>
											setFormData(prev => ({
												...prev,
												emergencyContact: {
													...prev.emergencyContact,
													name: e.target.value,
												},
											}))
										}
										className='bg-[#1A1F2E] border-gray-600 text-white text-sm'
										placeholder='Contact name'
									/>
								</div>
								<div>
									<Label htmlFor='emergencyPhone' className='text-sm'>
										Phone
									</Label>
									<Input
										id='emergencyPhone'
										value={formData.emergencyContact.phone}
										onChange={e =>
											setFormData(prev => ({
												...prev,
												emergencyContact: {
													...prev.emergencyContact,
													phone: e.target.value,
												},
											}))
										}
										className='bg-[#1A1F2E] border-gray-600 text-white text-sm'
										placeholder='Contact phone'
									/>
								</div>
								<div className='sm:col-span-2 lg:col-span-1'>
									<Label htmlFor='emergencyRelationship' className='text-sm'>
										Relationship
									</Label>
									<Select
										value={formData.emergencyContact.relationship}
										onValueChange={value =>
											setFormData(prev => ({
												...prev,
												emergencyContact: {
													...prev.emergencyContact,
													relationship: value,
												},
											}))
										}
									>
										<SelectTrigger className='bg-[#1A1F2E] border-gray-600 text-white text-sm'>
											<SelectValue placeholder='Select relationship' />
										</SelectTrigger>
										<SelectContent className='bg-[#1A1F2E] text-white border-gray-600'>
											<SelectItem value='Parent'>Parent</SelectItem>
											<SelectItem value='Spouse'>Spouse</SelectItem>
											<SelectItem value='Sibling'>Sibling</SelectItem>
											<SelectItem value='Friend'>Friend</SelectItem>
											<SelectItem value='Other'>Other</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>

						<div className='flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:col-span-2'>
							<Button
								type='submit'
								className='flex-1 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base'
							>
								<Upload className='w-4 h-4 mr-2' />
								Save Changes
							</Button>
							<Button
								type='button'
								variant='outline'
								onClick={() => setIsEditing(false)}
								className='flex-1 border-gray-600 text-white hover:bg-gray-800 text-sm sm:text-base'
							>
								Cancel
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}
