'use client'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Branch, BranchFormData } from '@/types'
import { useEffect, useState } from 'react'

interface BranchModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (branchData: BranchFormData) => void
	branch?: Branch | null
	isEditing?: boolean
}

function makeCodeFromName(name: string): string {
	const base = name.trim().toUpperCase().replace(/\s+/g, '')
	return base.slice(0, 8) || 'BR'
}

export default function BranchModal({
	isOpen,
	onClose,
	onSave,
	branch,
	isEditing = false,
}: BranchModalProps) {
	const [name, setName] = useState('')
	const [latitude, setLatitude] = useState<number | ''>('')
	const [longitude, setLongitude] = useState<number | ''>('')
	const [radius, setRadius] = useState<number | ''>('')
	const [error, setError] = useState('')

	useEffect(() => {
		if (isEditing && branch) {
			setName(branch.name)
			setLatitude(branch.location.coordinates?.latitude ?? '')
			setLongitude(branch.location.coordinates?.longitude ?? '')
			setRadius(branch.checkInRadiusMeters ?? '')
		} else {
			setName('')
			setLatitude('')
			setLongitude('')
			setRadius('')
		}
	}, [isEditing, branch, isOpen])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		if (!name.trim()) {
			setError('Filial nomini kiriting')
			return
		}
		const lat = typeof latitude === 'number' ? latitude : undefined
		const lon = typeof longitude === 'number' ? longitude : undefined
		const rad = typeof radius === 'number' ? radius : undefined
		const payload: BranchFormData = {
			name: name.trim(),
			code: isEditing && branch ? branch.code : makeCodeFromName(name),
			location: {
				address: isEditing && branch ? branch.location.address : name.trim(),
				city: isEditing && branch ? branch.location.city : '—',
				district: '',
				coordinates:
					lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon)
						? { latitude: lat, longitude: lon }
						: undefined,
			},
			checkInRadiusMeters: rad,
		}
		onSave(payload)
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="bg-[#0E1422] text-white border-none sm:max-w-[380px]">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold text-white">
						{isEditing ? 'Filialni tahrirlash' : 'Yangi filial'}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 mt-4">
					<div className="space-y-2">
						<Label htmlFor="name">Branch name *</Label>
						<Input
							id="name"
							value={name}
							onChange={e => setName(e.target.value)}
							className="bg-[#1A1F2E] border-none text-white"
							placeholder="Masalan: Chilonzor"
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<Label htmlFor="latitude">Latitude</Label>
							<Input
								id="latitude"
								type="number"
								step="any"
								value={latitude}
								onChange={e => {
									const v = e.target.value
									setLatitude(v === '' ? '' : parseFloat(v))
								}}
								className="bg-[#1A1F2E] border-none text-white h-9"
								placeholder="41.31"
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor="longitude">Longitude</Label>
							<Input
								id="longitude"
								type="number"
								step="any"
								value={longitude}
								onChange={e => {
									const v = e.target.value
									setLongitude(v === '' ? '' : parseFloat(v))
								}}
								className="bg-[#1A1F2E] border-none text-white h-9"
								placeholder="69.24"
							/>
						</div>
					</div>

					<div className="space-y-1 max-w-[140px]">
						<Label htmlFor="radius">Radius (m)</Label>
						<Input
							id="radius"
							type="number"
							min={50}
							max={500}
							value={radius}
							onChange={e => {
								const v = e.target.value
								setRadius(v === '' ? '' : parseInt(v, 10))
							}}
							className="bg-[#1A1F2E] border-none text-white h-9"
							placeholder="150"
						/>
					</div>

					{error && <p className="text-red-500 text-sm">{error}</p>}

					<div className="flex justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							className="bg-transparent text-white hover:bg-[#1A1F2E]"
						>
							Bekor
						</Button>
						<Button type="submit" className="bg-[#4E7BEE] hover:bg-[#4E7BEE]/90">
							{isEditing ? 'Saqlash' : "Qo'shish"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
