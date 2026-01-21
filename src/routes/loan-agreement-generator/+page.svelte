<script lang="ts">
	import { addMonths, format, intervalToDuration, isBefore, parseISO } from "date-fns"

	import { browser, dev } from "$app/environment"
	import { page } from "$app/state"
	import { trackEvent } from "$lib/analytics"
	import HelpModal from "$lib/components/HelpModal.svelte"
	import { Head } from "$lib/seo"

	import FAQ from "./FAQ.svelte"
	import { getSEOData } from "./seo"
	import type { ContractData, Witness } from "./types"

	// Form state
	let borrowerName = $state("")
	let borrowerAddress = $state("")
	let borrowerPhone = $state("")
	let borrowerEmail = $state("")

	let lenderName = $state("")
	let lenderAddress = $state("")
	let lenderPhone = $state("")
	let lenderEmail = $state("")

	let loanAmount = $state(5000)
	let loanCurrency = $state("USD")
	let loanPurpose = $state("")
	let loanDate = $state("")
	let repaymentDate = $state("")

	let witnesses = $state<Witness[]>([
		{ fullName: "", address: "", phone: "", email: "", gender: "" },
		{ fullName: "", address: "", phone: "", email: "", gender: "" },
	])

	let errors = $state<Record<string, string>>({})
	let isGenerating = $state(false)
	let errorModalElement: HTMLDialogElement | null = $state(null)

	// Reactive form validation state (for button disable, doesn't set errors)
	const isFormValid = $derived.by(() => {
		// Borrower validation
		if (!borrowerName.trim()) return false
		if (!borrowerAddress.trim()) return false
		if (borrowerPhone.trim() && !/^[\d\s\-+()]+$/.test(borrowerPhone)) return false
		if (borrowerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(borrowerEmail)) return false

		// Lender validation
		if (!lenderName.trim()) return false
		if (!lenderAddress.trim()) return false
		if (lenderPhone.trim() && !/^[\d\s\-+()]+$/.test(lenderPhone)) return false
		if (lenderEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lenderEmail)) return false

		// Loan validation
		if (loanAmount <= 0) return false
		if (!loanPurpose.trim()) return false
		if (!loanDate) return false
		if (!repaymentDate) return false
		if (loanDate && repaymentDate && new Date(repaymentDate) <= new Date(loanDate)) return false

		// Witness validation
		const validWitnesses = witnesses.filter(
			(w) => w.fullName.trim() && w.address.trim() && w.gender,
		)
		if (validWitnesses.length < 2) return false

		// Validate witness gender requirements
		if (validWitnesses.length >= 2) {
			const maleCount = validWitnesses.filter((w) => w.gender === "male").length
			const femaleCount = validWitnesses.filter((w) => w.gender === "female").length
			const totalWitnessValue = maleCount * 1.0 + femaleCount * 0.5

			if (maleCount === 0) return false
			if (totalWitnessValue < 2.0) return false
		}

		// Validate each witness's optional fields
		for (const witness of witnesses) {
			if (witness.fullName.trim() || witness.address.trim() || witness.gender) {
				if (witness.phone.trim() && !/^[\d\s\-+()]+$/.test(witness.phone)) return false
				if (witness.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(witness.email)) return false
			}
		}

		return true
	})

	// Set default loan date (today) - repayment date should be intentionally set by user
	$effect(() => {
		if (browser && !loanDate) {
			loanDate = format(new Date(), "yyyy-MM-dd")
		}
		// Repayment date left empty - user must consciously choose this important date
	})

	// Calculate loan term and format it human-friendly (showing max 2 most significant units)
	const loanTermDisplay = $derived.by(() => {
		if (!loanDate || !repaymentDate) return null
		const start = parseISO(loanDate)
		const end = parseISO(repaymentDate)
		if (isBefore(end, start)) return null

		const duration = intervalToDuration({ start, end })
		const parts: string[] = []

		if (duration.years && duration.years > 0) {
			parts.push(duration.years === 1 ? "1 year" : `${duration.years} years`)
		}
		if (duration.months && duration.months > 0 && parts.length < 2) {
			parts.push(duration.months === 1 ? "1 month" : `${duration.months} months`)
		}
		if (duration.days && duration.days > 0 && parts.length < 2) {
			parts.push(duration.days === 1 ? "1 day" : `${duration.days} days`)
		}

		return parts.length > 0 ? parts.join(" and ") : null
	})

	function validateForm(): boolean {
		errors = {}

		// Borrower validation
		if (!borrowerName.trim()) errors.borrowerName = "Borrower name is required"
		if (!borrowerAddress.trim()) errors.borrowerAddress = "Borrower address is required"
		if (borrowerPhone.trim() && !/^[\d\s\-+()]+$/.test(borrowerPhone)) {
			errors.borrowerPhone = "Invalid phone format"
		}
		if (borrowerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(borrowerEmail)) {
			errors.borrowerEmail = "Invalid email format"
		}

		// Lender validation
		if (!lenderName.trim()) errors.lenderName = "Lender name is required"
		if (!lenderAddress.trim()) errors.lenderAddress = "Lender address is required"
		if (lenderPhone.trim() && !/^[\d\s\-+()]+$/.test(lenderPhone)) {
			errors.lenderPhone = "Invalid phone format"
		}
		if (lenderEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lenderEmail)) {
			errors.lenderEmail = "Invalid email format"
		}

		// Loan validation
		if (loanAmount <= 0) errors.loanAmount = "Loan amount must be greater than 0"
		if (!loanPurpose.trim()) errors.loanPurpose = "Loan purpose is required"
		if (!loanDate) errors.loanDate = "Loan date is required"
		if (!repaymentDate) errors.repaymentDate = "Repayment date is required"
		else if (loanDate && new Date(repaymentDate) <= new Date(loanDate)) {
			errors.repaymentDate = "Repayment date must be after loan date"
		}

		// Witness validation (per Surah Al-Baqarah, verse 282: two men, or one man and two women)
		const validWitnesses = witnesses.filter(
			(w) => w.fullName.trim() && w.address.trim() && w.gender,
		)
		if (validWitnesses.length < 2) {
			errors.witnesses = "At least 2 witnesses are required (per Surah Al-Baqarah, verse 282)"
		}

		// Validate each witness
		witnesses.forEach((witness, index) => {
			if (witness.fullName.trim() || witness.address.trim() || witness.gender) {
				if (!witness.fullName.trim()) errors[`witness${index}Name`] = "Witness name is required"
				if (!witness.address.trim())
					errors[`witness${index}Address`] = "Witness address is required"
				if (!witness.gender) {
					errors[`witness${index}Gender`] = "Witness gender is required"
				}
				if (witness.phone.trim() && !/^[\d\s\-+()]+$/.test(witness.phone)) {
					errors[`witness${index}Phone`] = "Invalid phone format"
				}
				if (witness.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(witness.email)) {
					errors[`witness${index}Email`] = "Invalid email format"
				}
			}
		})

		// Validate witness gender requirements according to Surah Al-Baqarah, verse 282
		// Islamic principle: 1 man's witness = 2 women's witness (1 woman = 0.5 witness)
		// Contract requires at least 2.0 total witness value AND at least one man must be present
		if (validWitnesses.length >= 2) {
			const maleCount = validWitnesses.filter((w) => w.gender === "male").length
			const femaleCount = validWitnesses.filter((w) => w.gender === "female").length

			// Calculate total witness value: men count as 1.0, women count as 0.5
			const totalWitnessValue = maleCount * 1.0 + femaleCount * 0.5

			if (maleCount === 0) {
				errors.witnesses =
					"Per Surah Al-Baqarah, verse 282, at least one man must be present as a witness"
			} else if (totalWitnessValue < 2.0) {
				errors.witnesses =
					"Per Surah Al-Baqarah, verse 282, you need at least two men, or one man and two women."
			}
		}

		return Object.keys(errors).length === 0
	}

	function addWitness() {
		if (witnesses.length < 3) {
			witnesses = [...witnesses, { fullName: "", address: "", phone: "", email: "", gender: "" }]
		}
	}

	function removeWitness(index: number) {
		if (witnesses.length > 2) {
			witnesses = witnesses.filter((_, i) => i !== index)
		}
	}

	// Dev-only: Prefill form with sample data for testing
	function prefillForm() {
		borrowerName = "Ahmed Hassan"
		borrowerAddress = "123 Main Street, New York, NY 10001"
		borrowerPhone = "(555) 123-4567"
		borrowerEmail = "ahmed.hassan@example.com"

		lenderName = "Fatima Ali"
		lenderAddress = "456 Oak Avenue, Los Angeles, CA 90001"
		lenderPhone = "(555) 987-6543"
		lenderEmail = "fatima.ali@example.com"

		loanAmount = 10000
		loanCurrency = "USD"
		loanPurpose = "Personal loan for a new car"

		// Set dates: loan date today, repayment 6 months from now
		if (browser) {
			const today = new Date()
			loanDate = format(today, "yyyy-MM-dd")
			repaymentDate = format(addMonths(today, 6), "yyyy-MM-dd")
		}

		// Set witnesses with proper gender composition (2 men as according to Surah Al-Baqarah, verse 282)
		witnesses = [
			{
				fullName: "Omar Abdullah",
				address: "789 Pine Road, Chicago, IL 60601",
				phone: "(555) 111-2222",
				email: "omar.abdullah@example.com",
				gender: "male",
			},
			{
				fullName: "Sarah Malik",
				address: "321 Elm Street, Houston, TX 77001",
				phone: "(555) 333-4444",
				email: "sarah.malik@example.com",
				gender: "female",
			},
			{
				fullName: "Aisha Qurashi",
				address: "678 10th Street, Philadelphia, PA 19101",
				phone: "(555) 444-5555",
				email: "aisha.qurashi@example.com",
				gender: "female",
			},
		]

		// Clear any existing errors
		errors = {}
	}

	function getErrorSummary(): string[] {
		const errorList: string[] = []

		if (errors.borrowerName) errorList.push("Borrower: " + errors.borrowerName)
		if (errors.borrowerAddress) errorList.push("Borrower Address: " + errors.borrowerAddress)
		if (errors.borrowerPhone) errorList.push("Borrower Phone: " + errors.borrowerPhone)
		if (errors.borrowerEmail) errorList.push("Borrower Email: " + errors.borrowerEmail)

		if (errors.lenderName) errorList.push("Lender: " + errors.lenderName)
		if (errors.lenderAddress) errorList.push("Lender Address: " + errors.lenderAddress)
		if (errors.lenderPhone) errorList.push("Lender Phone: " + errors.lenderPhone)
		if (errors.lenderEmail) errorList.push("Lender Email: " + errors.lenderEmail)

		if (errors.loanAmount) errorList.push("Loan Amount: " + errors.loanAmount)
		if (errors.loanPurpose) errorList.push("Loan Purpose: " + errors.loanPurpose)
		if (errors.loanDate) errorList.push("Loan Date: " + errors.loanDate)
		if (errors.repaymentDate) errorList.push("Repayment Date: " + errors.repaymentDate)

		if (errors.witnesses) errorList.push("Witnesses: " + errors.witnesses)

		// Add individual witness errors
		witnesses.forEach((_, index) => {
			if (errors[`witness${index}Name`]) {
				errorList.push(`Witness ${index + 1} Name: ${errors[`witness${index}Name`]}`)
			}
			if (errors[`witness${index}Address`]) {
				errorList.push(`Witness ${index + 1} Address: ${errors[`witness${index}Address`]}`)
			}
			if (errors[`witness${index}Gender`]) {
				errorList.push(`Witness ${index + 1} Gender: ${errors[`witness${index}Gender`]}`)
			}
			if (errors[`witness${index}Phone`]) {
				errorList.push(`Witness ${index + 1} Phone: ${errors[`witness${index}Phone`]}`)
			}
			if (errors[`witness${index}Email`]) {
				errorList.push(`Witness ${index + 1} Email: ${errors[`witness${index}Email`]}`)
			}
		})

		return errorList
	}

	async function handleGeneratePDF(event: Event) {
		event.preventDefault()
		if (!validateForm()) {
			// Show error summary modal for better mobile/accessibility
			errorModalElement?.showModal()

			// Also scroll to first error for context
			const firstError = Object.keys(errors)[0]
			const element = document.querySelector(`[data-field="${firstError}"]`)
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" })
			}
			return
		}

		// Ensure we're in the browser before importing React/PDF libraries
		if (!browser) {
			alert("PDF generation is only available in the browser.")
			return
		}

		isGenerating = true

		try {
			// Dynamic import to ensure React/PDF libraries only load client-side
			const { downloadPDF } = await import("./contract-template")

			// Filter out empty witnesses (only name and address are required according to Surah Al-Baqarah, verse 282)
			const validWitnesses = witnesses.filter((w) => w.fullName.trim() && w.address.trim())

			const contractData: ContractData = {
				borrower: {
					fullName: borrowerName.trim(),
					address: borrowerAddress.trim(),
					phone: borrowerPhone.trim(),
					email: borrowerEmail.trim(),
				},
				lender: {
					fullName: lenderName.trim(),
					address: lenderAddress.trim(),
					phone: lenderPhone.trim(),
					email: lenderEmail.trim(),
				},
				loan: {
					amount: loanAmount,
					currency: loanCurrency,
					purpose: loanPurpose.trim(),
					loanDate,
					repaymentDate,
				},
				witnesses: validWitnesses,
			}

			// Generate filename - short and friendly
			const borrowerFirstName = borrowerName.trim().split(/\s+/)[0] || "loan"
			const dateStr = format(new Date(), "yyyy-MM-dd")
			const filename = `loan-agreement-${borrowerFirstName.toLowerCase()}-${dateStr}.pdf`

			await downloadPDF(contractData, filename)

			// Track successful PDF generation
			const loanTermDays =
				loanDate && repaymentDate
					? Math.ceil(
							(new Date(repaymentDate).getTime() - new Date(loanDate).getTime()) /
								(1000 * 60 * 60 * 24),
						)
					: null

			trackEvent("loan_agreement_generate", {
				amount: loanAmount,
				currency: loanCurrency,
				term_days: loanTermDays,
			})
		} catch (error) {
			console.error("Error generating PDF:", error)
			alert("An error occurred while generating the PDF. Please try again.")
		} finally {
			isGenerating = false
		}
	}

	// SEO metadata
	const seo = $derived.by(() => {
		return getSEOData(page.url.pathname, page.url.origin)
	})
</script>

<Head {seo} />

<div class="container mx-auto px-4 pt-8 pb-16 sm:w-3xl sm:min-w-3xl">
	<header class="max-w-screen px-4 pb-12 text-center sm:mx-auto sm:max-w-3xl">
		<h1 class="mb-6 text-4xl leading-tight font-bold">Islamic Loan Agreement</h1>
		<p class="mx-auto text-lg text-base-content/80 sm:text-xl">
			Generate <strong class="text-emerald-500">Sharia-compliant</strong>
			loan agreements based on
			<span class="whitespace-nowrap">
				<a
					href="https://quran.com/2/282"
					rel="noopener noreferrer"
					aria-label="Open Surah Al-Baqarah verse 282 in Quran"
					title="Open Surah Al-Baqarah verse 282 in Quran"
					class="border-b border-dashed border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
					target="_blank"
				>
					Surah Al-Baqarah verse 282.
				</a>
			</span>
			Interest-free contracts with proper documentation and witnesses.
		</p>
		{#if dev}
			<div class="mt-4">
				<button type="button" onclick={prefillForm} class="btn btn-outline btn-sm btn-warning">
					🧪 Dev: Prefill Form
				</button>
			</div>
		{/if}
	</header>

	<form onsubmit={handleGeneratePDF} class="mx-auto space-y-6">
		<!-- Borrower Information -->
		<fieldset class="fieldset rounded-box border border-base-content/20 p-4">
			<legend class="fieldset-legend text-base-content/50">Borrower Information</legend>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label class="input w-full" for="borrower-name" data-field="borrowerName">
						<span class="label">Full Name *</span>
						<input
							id="borrower-name"
							type="text"
							bind:value={borrowerName}
							required
							placeholder="John Doe"
							class:input-error={errors.borrowerName}
						/>
					</label>
					{#if errors.borrowerName}
						<div class="label-text-alt text-error">{errors.borrowerName}</div>
					{/if}
				</div>
				<div>
					<label class="input w-full" for="borrower-address" data-field="borrowerAddress">
						<span class="label">Full Address *</span>
						<input
							id="borrower-address"
							type="text"
							bind:value={borrowerAddress}
							required
							placeholder="e.g., 123 Main St, City, State 12345"
							class:input-error={errors.borrowerAddress}
						/>
					</label>
					{#if errors.borrowerAddress}
						<div class="label-text-alt text-error">{errors.borrowerAddress}</div>
					{/if}
				</div>
				<div>
					<label class="input w-full" for="borrower-phone" data-field="borrowerPhone">
						<span class="label">Phone (optional)</span>
						<input
							id="borrower-phone"
							type="tel"
							bind:value={borrowerPhone}
							placeholder="+1 (555) 123-4567"
							class:input-error={errors.borrowerPhone}
						/>
					</label>
					{#if errors.borrowerPhone}
						<div class="label-text-alt text-error">{errors.borrowerPhone}</div>
					{/if}
				</div>
				<div>
					<label class="input w-full" for="borrower-email" data-field="borrowerEmail">
						<span class="label">Email (optional)</span>
						<input
							id="borrower-email"
							type="email"
							bind:value={borrowerEmail}
							placeholder="email@example.com"
							class:input-error={errors.borrowerEmail}
						/>
					</label>
					{#if errors.borrowerEmail}
						<div class="label-text-alt text-error">{errors.borrowerEmail}</div>
					{/if}
				</div>
			</div>
		</fieldset>

		<!-- Lender Information -->
		<fieldset class="fieldset rounded-box border border-base-content/20 p-4">
			<legend class="fieldset-legend text-base-content/50">Lender Information</legend>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label class="input w-full" for="lender-name" data-field="lenderName">
						<span class="label">Full Name *</span>
						<input
							id="lender-name"
							type="text"
							bind:value={lenderName}
							required
							placeholder="Jane Smith"
							class:input-error={errors.lenderName}
						/>
					</label>
					{#if errors.lenderName}
						<div class="label-text-alt text-error">{errors.lenderName}</div>
					{/if}
				</div>
				<div>
					<label class="input w-full" for="lender-address" data-field="lenderAddress">
						<span class="label">Full Address *</span>
						<input
							id="lender-address"
							type="text"
							bind:value={lenderAddress}
							required
							placeholder="e.g., 123 Main St, City, State 12345"
							class:input-error={errors.lenderAddress}
						/>
					</label>
					{#if errors.lenderAddress}
						<div class="label-text-alt text-error">{errors.lenderAddress}</div>
					{/if}
				</div>
				<div>
					<label class="input w-full" for="lender-phone" data-field="lenderPhone">
						<span class="label">Phone (optional)</span>
						<input
							id="lender-phone"
							type="tel"
							bind:value={lenderPhone}
							placeholder="+1 (555) 123-4567"
							class:input-error={errors.lenderPhone}
						/>
					</label>
					{#if errors.lenderPhone}
						<div class="label-text-alt text-error">{errors.lenderPhone}</div>
					{/if}
				</div>
				<div>
					<label class="input w-full" for="lender-email" data-field="lenderEmail">
						<span class="label">Email (optional)</span>
						<input
							id="lender-email"
							type="email"
							bind:value={lenderEmail}
							placeholder="email@example.com"
							class:input-error={errors.lenderEmail}
						/>
					</label>
					{#if errors.lenderEmail}
						<div class="label-text-alt text-error">{errors.lenderEmail}</div>
					{/if}
				</div>
			</div>
		</fieldset>

		<!-- Loan Details -->
		<fieldset class="fieldset rounded-box border border-base-content/20 p-4">
			<legend class="fieldset-legend flex items-center gap-0 text-base-content/50">
				<span>Loan Details</span>
				<HelpModal
					title="Understanding Loan Terms"
					content={[
						'<strong class="text-blue-600/80 dark:text-blue-400/80">Loan Amount:</strong> The principal amount being borrowed. This is an interest-free loan (riba-free) as per Islamic principles.',
						'<strong class="text-blue-600/80 dark:text-blue-400/80">Loan Purpose:</strong> The reason for the loan (e.g., "Personal expense", "Business investment", "Education").',
						'<strong class="text-blue-600/80 dark:text-blue-400/80">Loan Date:</strong> The date when the loan is given to the borrower.',
						'<strong class="text-blue-600/80 dark:text-blue-400/80">Repayment Date:</strong> The date by which the loan must be fully repaid.',
						'<strong class="text-blue-600/80 dark:text-blue-400/80">Loan Term:</strong> Automatically calculated from the loan date and repayment date.',
					]}
					modalId="loan-details-help"
				/>
			</legend>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label class="input w-full" for="loan-amount" data-field="loanAmount">
						<span class="label">Loan Amount *</span>
						<div class="flex">
							<div>
								<input
									id="loan-amount"
									type="number"
									bind:value={loanAmount}
									required
									min="1"
									step="1"
									class="flex-1"
									class:input-error={errors.loanAmount}
								/>
							</div>
							<div>
								<select
									id="loan-currency"
									bind:value={loanCurrency}
									required
									class="select h-full w-20 border-none select-ghost outline-none"
								>
									<option value="USD">USD</option>
									<option value="EUR">EUR</option>
									<option value="GBP">GBP</option>
									<option value="CAD">CAD</option>
									<option value="AUD">AUD</option>
									<option value="JPY">JPY</option>
									<option value="CHF">CHF</option>
									<option value="CNY">CNY</option>
									<option value="INR">INR</option>
									<option value="SGD">SGD</option>
									<option value="AED">AED</option>
									<option value="SAR">SAR</option>
									<option value="MYR">MYR</option>
									<option value="IDR">IDR</option>
									<option value="PKR">PKR</option>
									<option value="BDT">BDT</option>
								</select>
							</div>
						</div>
					</label>
					{#if errors.loanAmount}
						<div class="label-text-alt text-error">{errors.loanAmount}</div>
					{/if}
				</div>
				<div>
					<label class="input w-full" for="loan-purpose" data-field="loanPurpose">
						<span class="label">Loan Purpose *</span>
						<input
							id="loan-purpose"
							type="text"
							bind:value={loanPurpose}
							required
							placeholder="e.g., Personal expense, Business investment, Education"
							class:input-error={errors.loanPurpose}
						/>
					</label>
					{#if errors.loanPurpose}
						<div class="label-text-alt text-error">{errors.loanPurpose}</div>
					{/if}
				</div>
				<div>
					<label class="input w-full" for="loan-date" data-field="loanDate">
						<span class="label">Loan Date *</span>
						<input
							id="loan-date"
							type="date"
							bind:value={loanDate}
							required
							class:input-error={errors.loanDate}
						/>
					</label>
					{#if errors.loanDate}
						<div class="label-text-alt text-error">{errors.loanDate}</div>
					{/if}
				</div>
				<div>
					<label class="input w-full" for="repayment-date" data-field="repaymentDate">
						<span class="label">Repayment Date *</span>
						<input
							id="repayment-date"
							type="date"
							bind:value={repaymentDate}
							required
							class:input-error={errors.repaymentDate}
						/>
					</label>
					{#if errors.repaymentDate}
						<div class="label-text-alt text-error">{errors.repaymentDate}</div>
					{:else if loanTermDisplay}
						<div class="label-text-alt text-right text-base-content/70">
							Loan term: {loanTermDisplay}
						</div>
					{/if}
				</div>
			</div>
		</fieldset>

		<!-- Witnesses -->
		<fieldset class="fieldset rounded-box border border-base-content/20 p-4">
			<legend class="fieldset-legend flex items-center gap-0 text-base-content/50">
				<span>Witnesses</span>
				<HelpModal
					title="Witness Requirements (Surah Al-Baqarah, verse 282)"
					content={[
						'According to <strong class="text-blue-600/80 dark:text-blue-400/80">Surah Al-Baqarah verse 282</strong>, witnesses are required for a loan contract.',
						'<strong class="text-blue-600/80 dark:text-blue-400/80">Required:</strong> Either (1) two male witnesses, or (2) one man and two women if two men are not available.',
						'<strong class="text-blue-600/80 dark:text-blue-400/80">Maximum:</strong> You can add up to 3 witnesses for additional documentation.',
						"All witnesses must provide their full name, address, and gender. Phone and email are optional.",
					]}
					modalId="witnesses-help"
				/>
			</legend>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{#each witnesses as witness, index (index)}
					<div class="rounded-box border border-base-content/10 p-4">
						<div class="mb-2 flex items-center justify-between">
							<div class="font-semibold">Witness {index + 1}</div>
							{#if witnesses.length > 2}
								<button
									type="button"
									onclick={() => removeWitness(index)}
									class="btn text-error btn-ghost btn-xs"
								>
									Remove
								</button>
							{/if}
						</div>
						<div class="space-y-4">
							<div>
								<label
									class="input w-full"
									for="witness-{index}-name"
									data-field="witness{index}Name"
								>
									<span class="label">Full Name {index < 2 ? "*" : ""}</span>
									<input
										id="witness-{index}-name"
										type="text"
										bind:value={witness.fullName}
										required={index < 2}
										placeholder="John Doe"
										class:input-error={errors[`witness${index}Name`]}
									/>
								</label>
								{#if errors[`witness${index}Name`]}
									<div class="label-text-alt text-error">{errors[`witness${index}Name`]}</div>
								{/if}
							</div>
							<div>
								<label
									class="input w-full"
									for="witness-{index}-address"
									data-field="witness{index}Address"
								>
									<span class="label">Address {index < 2 ? "*" : ""}</span>
									<input
										id="witness-{index}-address"
										type="text"
										bind:value={witness.address}
										required={index < 2}
										placeholder="e.g., 123 Main St, City, State 12345"
										class:input-error={errors[`witness${index}Address`]}
									/>
								</label>
								{#if errors[`witness${index}Address`]}
									<div class="label-text-alt text-error">{errors[`witness${index}Address`]}</div>
								{/if}
							</div>
							<div>
								<label
									class="input w-full"
									for="witness-{index}-gender"
									data-field="witness{index}Gender"
								>
									<span class="label">Gender {index < 2 ? "*" : ""}</span>
									<select
										id="witness-{index}-gender"
										bind:value={witness.gender}
										required={index < 2}
										class="select h-full border-none select-ghost outline-none"
										class:border-error={errors[`witness${index}Gender`]}
									>
										<option value="">Select gender</option>
										<option value="male">Male</option>
										<option value="female">Female</option>
									</select>
								</label>
								{#if errors[`witness${index}Gender`]}
									<div class="label-text-alt text-error">{errors[`witness${index}Gender`]}</div>
								{/if}
							</div>
							<div>
								<label
									class="input w-full"
									for="witness-{index}-phone"
									data-field="witness{index}Phone"
								>
									<span class="label">Phone (optional)</span>
									<input
										id="witness-{index}-phone"
										type="tel"
										bind:value={witness.phone}
										placeholder="+1 (555) 123-4567"
										class:input-error={errors[`witness${index}Phone`]}
									/>
								</label>
								{#if errors[`witness${index}Phone`]}
									<div class="label-text-alt text-error">{errors[`witness${index}Phone`]}</div>
								{/if}
							</div>
							<div>
								<label
									class="input w-full"
									for="witness-{index}-email"
									data-field="witness{index}Email"
								>
									<span class="label">Email (optional)</span>
									<input
										id="witness-{index}-email"
										type="email"
										bind:value={witness.email}
										placeholder="email@example.com"
										class:input-error={errors[`witness${index}Email`]}
									/>
								</label>
								{#if errors[`witness${index}Email`]}
									<div class="label-text-alt text-error">{errors[`witness${index}Email`]}</div>
								{/if}
							</div>
						</div>
					</div>
				{/each}
				{#if witnesses.length < 3}
					<button type="button" onclick={addWitness} class="btn w-full btn-outline btn-sm">
						Add Witness {witnesses.length + 1}
					</button>
				{/if}
			</div>
		</fieldset>

		<!-- Generate PDF Button -->
		<div class="flex justify-center pt-6">
			<button type="submit" class="btn btn-lg btn-primary" disabled={!isFormValid || isGenerating}>
				{#if isGenerating}
					<span class="loading loading-spinner"></span>
					Generating PDF...
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
						<polyline points="7 10 12 15 17 10"></polyline>
						<line x1="12" y1="15" x2="12" y2="3"></line>
					</svg>
					Generate & Download PDF
				{/if}
			</button>
		</div>
	</form>

	<FAQ />
</div>

<!-- Error Summary Modal -->
<dialog
	bind:this={errorModalElement}
	class="modal"
	role="alertdialog"
	aria-labelledby="error-modal-title"
>
	<div class="modal-box">
		<h2 id="error-modal-title" class="mb-4 text-xl font-bold text-error">
			Please Fix the Following Errors
		</h2>
		<div class="space-y-2">
			{#each getErrorSummary() as errorMessage, index (index)}
				<div class="flex items-start gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-5 w-5 shrink-0 text-error"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
						/>
					</svg>
					<p class="text-sm text-base-content/80">{errorMessage}</p>
				</div>
			{/each}
		</div>
		<div class="modal-action">
			<form method="dialog">
				<button type="submit" class="btn btn-primary">Close</button>
			</form>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button type="submit">close</button>
	</form>
</dialog>

<style lang="postcss">
	@reference "tailwindcss";

	input[type="number"] {
		@apply px-0 text-right;
	}
	legend {
		@apply px-1 py-0 text-center;
	}
</style>
