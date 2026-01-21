<script lang="ts">
	import { capitalize } from "radash"
	import { onMount } from "svelte"

	import { browser } from "$app/environment"
	import { page } from "$app/state"
	import HelpModal from "$lib/components/HelpModal.svelte"
	import { Head } from "$lib/seo"

	import { calc } from "./calculations"
	import FAQ from "./FAQ.svelte"
	import { getSEOData } from "./seo"
	import type { MonthlyRecord, MortgageResult, YearlyRecord } from "./types"

	let homePrice = $state(300000)
	let downPaymentPercent = $state(20)
	let termYears = $state(10)
	let maxTermYears = $state(15)
	let minTermYears = $state(3)
	let interestRate = $state(6.5)
	let annualRentalRate = $state(8.0)
	let fairMarketRent = $state(0)
	let monthlyBuyout = $state(0)
	let annualHomeGrowth = $state(4.5)
	let annualRentGrowth = $state(4)
	let appreciationModel = $state("balanced")
	let annualPropertyTaxRate = $state(1.2)
	let annualInsuranceRate = $state(0.4)
	let loanAmount = $state(0)
	let comparison = $state<MortgageResult | null>(null)
	let showMobileNotice = $state(false)
	let viewMode = $state("month") // "month" or "year"
	let selectedYear = $state(1) // Starting at year 1

	// Calculate values when inputs change
	$effect(() => {
		loanAmount = homePrice * (1 - downPaymentPercent / 100)
		monthlyBuyout = calc.monthlyBuyout(loanAmount, termYears)
		fairMarketRent = calc.fairMarketRent(homePrice, annualRentalRate)

		// Calculate comprehensive comparison
		comparison = calc.mortgageComparison(
			homePrice,
			downPaymentPercent,
			termYears,
			interestRate,
			monthlyBuyout,
			annualRentalRate,
			annualHomeGrowth,
			annualRentGrowth,
			annualPropertyTaxRate,
			annualInsuranceRate,
		)
	})

	$effect(() => {
		if (appreciationModel === "conservative") {
			annualHomeGrowth = 4.0
			annualRentGrowth = 4.0
		} else if (appreciationModel === "balanced") {
			annualHomeGrowth = 4.5
			annualRentGrowth = 4.0
		} else if (appreciationModel === "optimistic") {
			annualHomeGrowth = 5.0
			annualRentGrowth = 4.5
		}
	})

	// Check if device is mobile and show notice
	onMount(() => {
		if (browser) {
			const hasSeenNotice = localStorage.getItem("hasSeenMobileNotice")
			const isMobile = window.innerWidth < 1024 // Tailwind's lg breakpoint

			if (isMobile && !hasSeenNotice) {
				showMobileNotice = true
				localStorage.setItem("hasSeenMobileNotice", "true")
			}
		}
	})

	function dismissMobileNotice() {
		showMobileNotice = false
	}

	// Calculate paginated data based on view mode (using year-based slider for monthly view)
	function getPaginatedData() {
		if (!comparison) return { data: [], totalYears: 0, currentYear: 0 }

		if (viewMode === "year") {
			// For yearly view, show all years without pagination
			return {
				data: comparison.yearlyBreakdown,
				totalYears: comparison.yearlyBreakdown.length,
			}
		} else {
			// For monthly view, show the selected year's months
			const totalMonths = comparison.monthlyBreakdown.length
			const totalYears = Math.ceil(totalMonths / 12)

			// Calculate start and end index for the selected year
			const startIndex = (selectedYear - 1) * 12 // 0-based index
			const endIndex = Math.min(startIndex + 12, totalMonths)
			const paginatedData = comparison.monthlyBreakdown.slice(startIndex, endIndex)

			return {
				data: paginatedData,
				totalYears,
				currentYear: selectedYear,
			}
		}
	}

	// Function to handle year slider change
	function handleYearChange(event: Event) {
		selectedYear = parseInt((event.target as HTMLInputElement).value)
	}

	// Reset to page 1 when changing view mode
	function toggleViewMode() {
		viewMode = viewMode === "month" ? "year" : "month"
	}

	// SEO metadata - page.url.origin works correctly in both SSR and client
	const seo = $derived.by(() => {
		return getSEOData(page.url.pathname, page.url.origin)
	})
</script>

<Head {seo} />
{#if showMobileNotice}
	<div
		class="fixed right-4 bottom-4 left-4 z-50 rounded-lg bg-primary p-4 text-primary-content shadow-lg"
	>
		<div class="flex items-start justify-between">
			<div>
				<h3 class="font-bold">Use this app on a larger screen</h3>
				<p class="mt-1 text-sm">
					This application looks best on a larger screen. For the best experience, consider using a
					tablet or computer.
				</p>
			</div>
			<button
				onclick={dismissMobileNotice}
				class="btn btn-circle btn-ghost btn-sm"
				aria-label="Dismiss notice"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>
	</div>
{/if}

<div class="container mx-auto w-7xl min-w-7xl p-4">
	<header class="-m-4 max-w-screen px-4 pt-4 pb-12 text-center sm:mx-auto sm:max-w-3xl sm:pt-6">
		<h1 class="mb-6 text-3xl leading-tight font-bold sm:text-5xl">
			Islamic Home Financing Calculator
		</h1>
		<p class="mx-auto text-lg text-base-content/80 sm:text-xl">
			Compare <strong class="text-emerald-500">Sharia-compliant</strong>
			partnership financing
			<span class="whitespace-nowrap">(Diminishing Musharaka)</span>
			with conventional interest-based mortgages.
		</p>
	</header>

	<div class="grid grid-cols-7 gap-6">
		<div class="col-span-2 flex flex-col gap-4">
			<!-- Property Details -->
			<fieldset class="fieldset rounded-box border border-base-content/20 p-4">
				<legend class="fieldset-legend text-base-content/50">Property Details</legend>
				<label class="input" for="home-price">
					<span class="label">Home Price ($)</span>
					<input id="home-price" type="number" bind:value={homePrice} step="1000" min="10000" />
				</label>
				<label class="input" for="down-payment">
					<span class="label">Down Payment (%)</span>
					<input
						id="down-payment"
						type="number"
						bind:value={downPaymentPercent}
						step="1"
						min="10"
						max="100"
					/>
				</label>
				<label class="input" for="term-years">
					<span class="label">Term = {termYears} Years</span>
					<input
						id="term-years"
						type="range"
						bind:value={termYears}
						min={minTermYears}
						max={maxTermYears}
						step="1"
						class="range range-sm"
						aria-label="Loan term in years"
					/>
				</label>
			</fieldset>
			<!-- Financing Options -->
			<fieldset class="fieldset rounded-box border border-base-content/20 p-4">
				<legend class="fieldset-legend flex items-center gap-0 text-base-content/50">
					<span>Financing Options</span>
					<HelpModal
						title="Understanding Financing Rates"
						content={[
							'<strong class="text-blue-600/80 dark:text-blue-400/80">Conventional Interest (%)</strong> is the annual interest rate charged by traditional banks on mortgage loans. This is riba (interest) - money charged for the use of money, which is prohibited in Islamic finance.',
							'<strong class="text-blue-600/80 dark:text-blue-400/80">Annual Rental Rate (%)</strong> is NOT interest. It represents the estimated fair market rental rate for the property, used to calculate rent payments on the partner\'s ownership share in halal financing. This rate is subject to fair market value assessment and reflects payment for the use of an asset (the property), not money.',
							'<strong class="text-blue-600/80 dark:text-blue-400/80">Key Difference:</strong> Interest (riba) is payment for the use of money, while rent is payment for the use of a physical asset. In halal financing, you pay rent on the partner\'s share of the property, which is permissible in Islamic law. The rental rate should reflect what the property would rent for in the open market.',
						]}
						modalId="financing-options-help"
					/>
				</legend>
				<label class="input" for="interest-rate">
					<span class="label">Conventional Interest (%)</span>
					<input
						id="interest-rate"
						type="number"
						bind:value={interestRate}
						step="0.01"
						min="0"
						max="100"
					/>
				</label>
				<label class="input" for="rental-rate">
					<span class="label">Annual Rental Rate (%)</span>
					<input
						id="rental-rate"
						type="number"
						bind:value={annualRentalRate}
						step="0.01"
						min="0"
						max="100"
					/>
				</label>
			</fieldset>
			<!-- Buyout & Rent -->
			<fieldset class="fieldset rounded-box border border-base-content/20 p-4">
				<legend class="fieldset-legend flex items-center gap-0 text-base-content/50">
					<span>Buyout & Rent</span>
					<HelpModal
						title="Understanding Buyout & Rent"
						content={[
							"<strong class=\"text-blue-600/80 dark:text-blue-400/80\">Monthly Buyout ($)</strong> is the amount you pay each month to purchase the partner's ownership share of the property. This is the principal repayment component in halal financing. As you make buyout payments, your ownership percentage increases while the partner's decreases.",
							'<strong class="text-blue-600/80 dark:text-blue-400/80">Fair Market Rent ($)</strong> is automatically calculated based on the home price and annual rental rate. It represents the estimated monthly rent for the entire property at fair market value. This is a reference value showing what the property would rent for in the open market.',
							"<strong class=\"text-blue-600/80 dark:text-blue-400/80\">How It Works:</strong> In diminishing musharaka, you pay rent on the partner's share of the property (which decreases over time) plus a monthly buyout to gradually acquire full ownership. The rent component decreases as the partner's ownership decreases, while your buyout payments increase your equity.",
						]}
						modalId="buyout-rent-help"
					/>
				</legend>
				<label class="input" for="monthly-buyout">
					<span class="label">Monthly Buyout ($)</span>
					<input id="monthly-buyout" type="number" bind:value={monthlyBuyout} step="10" min="10" />
				</label>
				<label class="input" for="fair-market-rent">
					<span class="label">Fair Market Rent ($)</span>
					<input
						id="fair-market-rent"
						type="number"
						bind:value={fairMarketRent}
						min={(homePrice * 0.4) / 100}
						max={(homePrice * 1.0) / 100}
						step="100"
						readonly
						aria-label="Fair market rent (read-only, calculated automatically)"
					/>
				</label>
			</fieldset>
			<!-- Property Costs -->
			<fieldset class="fieldset rounded-box border border-base-content/20 p-4">
				<legend class="fieldset-legend flex items-center gap-0 text-base-content/50">
					<span>Property Costs</span>
					<HelpModal
						title="Understanding Property Costs"
						content={[
							'<strong class="text-blue-600/80 dark:text-blue-400/80">Annual Property Tax (%)</strong> is the annual property tax rate based on your home\'s assessed value. Property taxes are typically 0.5% to 2% of home value, varying by location. These taxes grow with home appreciation over time.',
							'<strong class="text-blue-600/80 dark:text-blue-400/80">Annual Insurance (%)</strong> is the annual homeowners insurance rate, typically 0.25% to 0.5% of home value. Insurance protects against property damage and liability, and costs also increase as the home value appreciates.',
							'<strong class="text-blue-600/80 dark:text-blue-400/80">Conventional Loans (Escrow):</strong> In U.S. conventional mortgages, insurance and property tax are typically collected through an escrow account. The lender estimates annual costs, divides by 12, and adds this amount to your monthly payment (PITI = Principal + Interest + Taxes + Insurance). This creates equal monthly payments, even though actual insurance and tax costs increase with property appreciation. The escrow account is recalculated annually, but your monthly payment stays constant until the next adjustment.',
							'<strong class="text-blue-600/80 dark:text-blue-400/80">Halal Financing (Proportional):</strong> In halal financing, insurance and property tax are split proportionally based on ownership - you pay your share based on your ownership percentage, and the partner pays their share. As your ownership increases, your share of these costs increases proportionally. This reflects the fair sharing of property expenses in a partnership structure.',
						]}
						modalId="property-costs-help"
					/>
				</legend>
				<label class="input" for="property-tax-rate">
					<span class="label">Annual Property Tax (%)</span>
					<input
						id="property-tax-rate"
						type="number"
						bind:value={annualPropertyTaxRate}
						step="0.1"
						min="0"
						max="5"
					/>
				</label>
				<label class="input" for="insurance-rate">
					<span class="label">Annual Insurance (%)</span>
					<input
						id="insurance-rate"
						type="number"
						bind:value={annualInsuranceRate}
						step="0.1"
						min="0"
						max="5"
					/>
				</label>
			</fieldset>
			<!-- Growth Scenarios -->
			<fieldset class="fieldset rounded-box border border-base-content/20 p-4">
				<legend class="fieldset-legend flex items-center gap-0 text-base-content/50">
					<span>YoY Appreciation</span>
					<HelpModal
						title="Understanding YoY Appreciation"
						content={[
							'<strong class="text-blue-600/80 dark:text-blue-400/80">Rent Growth (%)</strong> represents the annual increase in rental rates due to market inflation and rent adjustments. This affects the monthly rent you pay on the partner\'s share of the property.',
							'<strong class="text-blue-600/80 dark:text-blue-400/80">Home Growth (%)</strong> represents the annual appreciation of the property value. This is used only for projection purposes to estimate your net gain at the end of the term.',
							"These are separate concepts: rent growth affects your monthly payments, while home growth affects your final equity position. Neither represents riba (interest) - rent is payment for use of an asset, and property appreciation reflects real asset value changes.",
						]}
						modalId="yoy-appreciation-help"
					/>
				</legend>
				<div class="flex justify-between gap-4">
					<div class="flex flex-col gap-2 select-none">
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="scenario"
								value="conservative"
								bind:group={appreciationModel}
								class="radio"
								aria-label="Conservative growth scenario"
							/>
							<span>Conservative</span>
						</label>
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="scenario"
								value="balanced"
								bind:group={appreciationModel}
								class="radio"
								aria-label="Balanced growth scenario"
							/>
							<span>Balanced</span>
						</label>
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="scenario"
								value="optimistic"
								bind:group={appreciationModel}
								class="radio"
								aria-label="Optimistic growth scenario"
							/>
							<span>Optimistic</span>
						</label>
					</div>
					<div class="flex flex-col gap-2">
						<label class="input" for="rent-growth">
							<span class="label">Rent (%)</span>
							<input
								id="rent-growth"
								type="number"
								bind:value={annualRentGrowth}
								step="0.1"
								min="0"
								max="10"
							/>
						</label>
						<label class="input" for="home-growth">
							<span class="label">Home (%)</span>
							<input
								id="home-growth"
								type="number"
								bind:value={annualHomeGrowth}
								step="0.1"
								min="0"
								max="10"
							/>
						</label>
					</div>
				</div>
			</fieldset>
		</div>
		<fieldset class="col-span-5 fieldset rounded-box border border-base-content/20 p-4">
			<legend class="fieldset-legend text-base-content/50">Financing Comparison</legend>
			<div class="overflow-x-auto">
				{#if comparison}
					<table class="table table-fixed">
						<thead>
							<tr>
								<th class="w-56 min-w-56"></th>
								<th class="w-1/2">Conventional Loan</th>
								<th class="w-1/2">Halal Financing</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="text-base-content/70">Down payment</td>
								<td>
									${Math.round(homePrice * (downPaymentPercent / 100)).toLocaleString()}
									<span class="text-xs text-base-content/50">({downPaymentPercent}%)</span>
								</td>
								<td>
									${Math.round(homePrice * (downPaymentPercent / 100)).toLocaleString()}
									<span class="text-xs text-base-content/50">({downPaymentPercent}%)</span>
								</td>
							</tr>
							<tr>
								<td class="text-base-content/70">Lender's / Partners' share</td>
								<td>
									${comparison.loanAmount.toLocaleString()}
									<span class="text-xs text-base-content/50">
										(Loan amount: {100 - downPaymentPercent}%)
									</span>
								</td>
								<td>
									${comparison.loanAmount.toLocaleString()}
									<span class="text-xs text-base-content/50">
										(Partners' share: {100 - downPaymentPercent}%)
									</span>
								</td>
							</tr>
							<tr>
								<td class="text-base-content/70">
									<div class="flex items-center gap-1">
										<span>Avg. monthly payment</span>
										<HelpModal
											title="Understanding Monthly Payments"
											content={[
												'<strong class="text-blue-600/80 dark:text-blue-400/80">Conventional Loan:</strong> The monthly payment (PITI) includes Principal + Interest + Taxes + Insurance. In U.S. practice, insurance and property tax are escrowed - the lender estimates annual costs, divides by 12, and adds to your payment. This creates equal monthly payments throughout the year, even though actual insurance and tax costs increase with property appreciation. The escrow is recalculated annually.',
												'<strong class="text-blue-600/80 dark:text-blue-400/80">Halal Financing:</strong> The monthly payment includes Rent + Buyout + Your share of Insurance + Your share of Property Tax. Since your ownership percentage increases over time, your share of insurance and tax increases proportionally, while rent decreases as the partner\'s ownership decreases. This results in varying monthly payments that reflect the changing ownership structure.',
											]}
											modalId="monthly-payment-help"
										/>
									</div>
								</td>
								<td>
									${Math.round(comparison.conventional.averageMonthlyPayment).toLocaleString()}
								</td>
								<td>${Math.round(comparison.halal.averageMonthlyPayment).toLocaleString()}</td>
							</tr>
							<tr>
								<td class="text-base-content/70">Total amount paid in {termYears} years</td>
								<td>${Math.round(comparison.conventional.totalCost).toLocaleString()}</td>
								<td>${Math.round(comparison.halal.totalCost).toLocaleString()}</td>
							</tr>
							<tr>
								<td class="text-base-content/70">Insurance paid by partners</td>
								<td>—</td>
								<td>${Math.round(comparison.halal.partnerInsurancePaid).toLocaleString()}</td>
							</tr>
							<tr>
								<td class="text-base-content/70">Property tax paid by partners</td>
								<td>—</td>
								<td>${Math.round(comparison.halal.partnerPropertyTaxPaid).toLocaleString()}</td>
							</tr>
							<tr>
								<td class="text-base-content/70">Partners' gross rent income</td>
								<td>—</td>
								<td>${Math.round(comparison.halal.totalRentIncome).toLocaleString()}</td>
							</tr>
							<tr>
								<td class="text-base-content/70">Lender's / Partners' net earnings</td>
								<td>
									${Math.round(comparison.conventional.lenderInterest).toLocaleString()}
									<span class="text-xs text-base-content/50">(Interest)</span>
								</td>
								<td>
									${Math.round(comparison.halal.partnerNetEarnings).toLocaleString()}
									<span class="text-xs text-base-content/50">
										(Profit: {comparison.halal.roiPercent.toFixed(1)}% ROI,
										{comparison.halal.annualizedRoiPercent.toFixed(2)}% annualized)
									</span>
								</td>
							</tr>
							<tr>
								<td class="text-base-content/70">Ownership structure</td>
								<td>100% ownership from start, with lender holding lien.</td>
								<td>Gradual increase from {downPaymentPercent}% to 100% ownership.</td>
							</tr>
							<tr>
								<td class="text-base-content/70">House appreciation</td>
								<td colspan="2">
									${Math.round(comparison.house.initialValue).toLocaleString()} → ${Math.round(
										comparison.house.projectedValue,
									).toLocaleString()}
									(+${Math.round(comparison.house.appreciation).toLocaleString()}) after {termYears}
									years
								</td>
							</tr>
							<tr>
								<td class="text-base-content/70">Expected gain after {termYears} years</td>
								<td>${Math.round(comparison.conventional.netGain).toLocaleString()}</td>
								<td>${Math.round(comparison.halal.netGain).toLocaleString()}</td>
							</tr>
							<tr>
								<td class="text-base-content/70">Financial advantage</td>
								<td colspan="2">{comparison.advantage.overallAdvantage}</td>
							</tr>
							<tr>
								<td class="text-base-content/70">Spiritual advantage</td>
								<td colspan="2">
									With halal financing, you'll avoid riba, bringing peace of mind and alignment with
									your religious values.
								</td>
							</tr>
						</tbody>
					</table>
				{:else}
					<div class="flex justify-center p-4">
						<span class="loading loading-lg loading-spinner"></span>
					</div>
				{/if}
			</div>
		</fieldset>

		{#if comparison && comparison.monthlyBreakdown?.length > 0}
			<fieldset class="col-span-7 mt-6 fieldset rounded-box border border-base-content/20 p-4">
				<legend class="fieldset-legend text-base-content/50">
					{capitalize(viewMode)}ly Payment Breakdown
				</legend>

				<div class="overflow-x-auto">
					<table class="breakdown-table table table-sm">
						<thead>
							<tr>
								<th class="relative">
									<label
										class="absolute top-2 label cursor-pointer select-none"
										for="view-mode-toggle"
									>
										<div class="flex items-center gap-2">
											<span
												class={viewMode === "month" ? "text-base-content" : "text-base-content/50"}
											>
												Month
											</span>
											<input
												id="view-mode-toggle"
												type="checkbox"
												class="toggle border-base-content text-base-content toggle-xs"
												onclick={toggleViewMode}
												checked={viewMode === "year"}
												aria-label="Toggle between monthly and yearly view"
											/>
											<span
												class={viewMode === "year" ? "text-base-content" : "text-base-content/50"}
											>
												Year
											</span>
										</div>
									</label>
								</th>
								<th colspan="7" class="w-140! max-w-140! border-base-content/10 text-center">
									Conventional Loan
								</th>
								<th colspan="8" class="border-l border-base-content/10 text-center">
									Halal Financing
								</th>
							</tr>
							<tr>
								<th class="w-20! max-w-20! border-r border-base-content/10"></th>
								<th>Payment</th>
								<th>Interest</th>
								<th>Principal</th>
								<th>Insurance</th>
								<th>Tax</th>
								<th>Start Bal.</th>
								<th>End Bal.</th>
								<th class="border-l border-base-content/10">Payment</th>
								<th>Rent</th>
								<th>Buyout</th>
								<th>Insurance</th>
								<th>Tax</th>
								<th>Own %</th>
								<th>Start Bal.</th>
								<th>End Bal.</th>
							</tr>
						</thead>
						<tbody>
							{#each getPaginatedData().data as record, index (index)}
								<tr>
									<td class="border-r border-base-content/10">
										{#if viewMode === "month"}
											Month {(record as MonthlyRecord).month}
										{:else}
											Year {(record as YearlyRecord).year}
										{/if}
									</td>
									{#if viewMode === "month"}
										<td>${Math.round(record.conventional.totalPayment).toLocaleString()}</td>
										<td>${Math.round(record.conventional.interestPaid).toLocaleString()}</td>
										<td>${Math.round(record.conventional.principalPaid).toLocaleString()}</td>
										<td>${Math.round(record.conventional.insurancePaid).toLocaleString()}</td>
										<td>${Math.round(record.conventional.propertyTaxPaid).toLocaleString()}</td>
										<td>${Math.round(record.conventional.beginningBalance).toLocaleString()}</td>
										<td>${Math.round(record.conventional.endingBalance).toLocaleString()}</td>
										<td class="border-l border-base-content/10">
											${Math.round(record.halal.totalPayment).toLocaleString()}
										</td>
										<td>${Math.round(record.halal.rentComponent).toLocaleString()}</td>
										<td>${Math.round(record.halal.buyoutComponent).toLocaleString()}</td>
										<td>${Math.round(record.halal.insurancePaid).toLocaleString()}</td>
										<td>${Math.round(record.halal.propertyTaxPaid).toLocaleString()}</td>
										<td>{record.halal.tenantOwnershipPercent.toFixed(1)}%</td>
										<td>${Math.round(record.halal.beginningBalance).toLocaleString()}</td>
										<td>${Math.round(record.halal.endingBalance).toLocaleString()}</td>
									{:else}
										<td>${Math.round(record.conventional.totalPayment).toLocaleString()}</td>
										<td>${Math.round(record.conventional.interestPaid).toLocaleString()}</td>
										<td>${Math.round(record.conventional.principalPaid).toLocaleString()}</td>
										<td>${Math.round(record.conventional.insurancePaid).toLocaleString()}</td>
										<td>${Math.round(record.conventional.propertyTaxPaid).toLocaleString()}</td>
										<td>${Math.round(record.conventional.beginningBalance).toLocaleString()}</td>
										<td>${Math.round(record.conventional.endingBalance).toLocaleString()}</td>
										<td class="border-l border-base-content/10">
											${Math.round(record.halal.totalPayment).toLocaleString()}
										</td>
										<td>${Math.round(record.halal.rentComponent).toLocaleString()}</td>
										<td>${Math.round(record.halal.buyoutComponent).toLocaleString()}</td>
										<td>${Math.round(record.halal.insurancePaid).toLocaleString()}</td>
										<td>${Math.round(record.halal.propertyTaxPaid).toLocaleString()}</td>
										<td>{record.halal.tenantOwnershipPercent.toFixed(1)}%</td>
										<td>${Math.round(record.halal.beginningBalance).toLocaleString()}</td>
										<td>${Math.round(record.halal.endingBalance).toLocaleString()}</td>
									{/if}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Monthly view controls -->
				{#if viewMode === "month" && comparison?.monthlyBreakdown?.length > 12}
					<div class="my-4 flex flex-col items-center gap-2">
						<div class="text-center">
							Showing Year {selectedYear} of {getPaginatedData().totalYears}
						</div>
						<div class="flex w-full max-w-md items-center gap-2">
							<span>Year 1</span>
							<input
								id="year-selector"
								type="range"
								min="1"
								max={Math.ceil(comparison.monthlyBreakdown.length / 12)}
								value={selectedYear}
								class="range flex-1 range-sm"
								step="1"
								oninput={handleYearChange}
								aria-label="Select year to view monthly breakdown"
							/>
							<span>Year {Math.ceil(comparison.monthlyBreakdown.length / 12)}</span>
						</div>
					</div>
				{/if}
			</fieldset>
		{/if}
	</div>

	<FAQ />
</div>

<style lang="postcss">
	@reference "tailwindcss";

	input[type="number"] {
		@apply px-0 text-right;
	}
	legend {
		@apply px-1 py-0 text-center;
	}
	th {
		@apply font-normal;
	}
	td,
	th {
		@apply align-top;
		&:first-child {
			@apply pl-0!;
		}
		&:last-child {
			@apply pr-0!;
		}
	}
	.breakdown-table {
		td,
		th {
			@apply w-18 max-w-18 px-2;
		}
		tr:not(:first-child) th,
		td {
			&:not(:first-child) {
				@apply text-right;
			}
			&:nth-child(6) {
				@apply pr-6;
			}
		}
	}
</style>
