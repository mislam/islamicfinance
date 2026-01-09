<script lang="ts">
	import { capitalize } from "radash"
	import { onMount } from "svelte"

	import { browser } from "$app/environment"

	import { calc } from "./calculations"
	import type { MonthlyRecord, MortgageResult, YearlyRecord } from "./types"

	let homePrice = $state(300000)
	let downPaymentPercent = $state(20)
	let termYears = $state(20)
	let interestRate = $state(6.9)
	let annualRentalRate = $state(8.4)
	let fairMarketRent = $state(0)
	let monthlyBuyout = $state(0)
	let annualHomeGrowth = $state(4.5)
	let annualRentGrowth = $state(4)
	let appreciationModel = $state("balanced")
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
</script>

<svelte:head>
	<title>Islamic Home Financing vs. Conventional Mortgage</title>
	<meta property="og:title" content="Islamic Home Financing vs. Conventional Mortgage" />
	<meta
		property="og:description"
		content="Compare Islamic Partnership & Lease Structure with Traditional Interest-Based Mortgages"
	/>
	<!-- <meta property="og:image" content="https://openislamicfinance.com/og-image.png" />
	<meta property="og:url" content="https://openislamicfinance.com" /> -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Open Islamic Finance" />
	<meta property="og:locale" content="en_US" />
</svelte:head>
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

<div class="container mx-auto w-5xl min-w-5xl p-4">
	<header class="mb-8 text-center">
		<h1 class="mb-1 text-2xl font-bold">Islamic Home Financing vs. Conventional Mortgage</h1>
		<p class="text-base-content/70">
			Compare Islamic Partnership & Lease Structure with Traditional Interest-Based Mortgages
		</p>
	</header>

	<div class="grid grid-cols-3 gap-6">
		<div class="flex flex-col gap-4">
			<!-- Property Details -->
			<fieldset class="fieldset rounded-box border border-base-content/20 p-4">
				<legend class="fieldset-legend text-base-content/50">Property Details</legend>
				<label class="input">
					<span class="label">Home Price ($)</span>
					<input type="number" bind:value={homePrice} step="1000" min="10000" />
				</label>
				<label class="input">
					<span class="label">Down Payment (%)</span>
					<input type="number" bind:value={downPaymentPercent} step="1" min="10" max="100" />
				</label>
				<label class="input">
					<span class="label">Term = {termYears} Years</span>
					<input
						type="range"
						bind:value={termYears}
						min="5"
						max="30"
						step="1"
						class="range range-sm"
					/>
				</label>
			</fieldset>
			<!-- Financing Options -->
			<fieldset class="fieldset rounded-box border border-base-content/20 p-4">
				<legend class="fieldset-legend text-base-content/50">Financing Options</legend>
				<label class="input">
					<span class="label">Conventional Interest (%)</span>
					<input type="number" bind:value={interestRate} step="0.01" min="0" max="100" />
				</label>
				<label class="input">
					<span class="label">Annual Rental Rate (%)</span>
					<input type="number" bind:value={annualRentalRate} step="0.01" min="0" max="100" />
				</label>
			</fieldset>
			<!-- Buyout & Rent -->
			<fieldset class="fieldset rounded-box border border-base-content/20 p-4">
				<legend class="fieldset-legend text-base-content/50">Buyout & Rent</legend>
				<label class="input">
					<span class="label">Monthly Buyout ($)</span>
					<input type="number" bind:value={monthlyBuyout} step="10" min="10" />
				</label>
				<label class="input">
					<span class="label">Fair Market Rent ($)</span>
					<input
						type="number"
						bind:value={fairMarketRent}
						min={(homePrice * 0.4) / 100}
						max={(homePrice * 1.0) / 100}
						step="100"
						readonly
					/>
				</label>
			</fieldset>
			<!-- Growth Scenarios -->
			<fieldset class="fieldset rounded-box border border-base-content/20 p-4">
				<legend class="fieldset-legend text-base-content/50">YoY Appreciation</legend>
				<div class="flex gap-4">
					<div class="flex flex-col gap-2 select-none">
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="scenario"
								value="conservative"
								bind:group={appreciationModel}
								class="radio"
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
							/>
							<span>Optimistic</span>
						</label>
					</div>
					<div class="flex flex-col gap-2">
						<label class="input">
							<span class="label">Rent (%)</span>
							<input type="number" bind:value={annualRentGrowth} step="0.1" min="0" max="10" />
						</label>
						<label class="input">
							<span class="label">Home (%)</span>
							<input type="number" bind:value={annualHomeGrowth} step="0.1" min="0" max="10" />
						</label>
					</div>
				</div>
			</fieldset>
		</div>
		<fieldset class="col-span-2 fieldset rounded-box border border-base-content/20 p-4">
			<legend class="fieldset-legend text-base-content/50">Financing Comparison</legend>
			<div class="overflow-x-auto">
				{#if comparison}
					<table class="comparison-table table">
						<thead>
							<tr>
								<th class="min-w-48"></th>
								<th>Conventional Loan</th>
								<th>Halal Financing</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="text-base-content/60">Loan Amount</td>
								<td>${comparison.loanAmount.toLocaleString()}</td>
								<td>${comparison.loanAmount.toLocaleString()}</td>
							</tr>
							<tr>
								<td class="text-base-content/60">Avg. Monthly Payment</td>
								<td>
									${Math.round(comparison.conventional.averageMonthlyPayment).toLocaleString()}
								</td>
								<td>${Math.round(comparison.halal.averageMonthlyPayment).toLocaleString()}</td>
							</tr>
							<tr>
								<td class="text-base-content/60">Total Payments</td>
								<td>${Math.round(comparison.conventional.totalPayments).toLocaleString()}</td>
								<td>${Math.round(comparison.halal.totalPayments).toLocaleString()}</td>
							</tr>
							<tr>
								<td class="text-base-content/60">Total Cost</td>
								<td>${Math.round(comparison.conventional.totalCost).toLocaleString()}</td>
								<td>${Math.round(comparison.halal.totalCost).toLocaleString()}</td>
							</tr>
							<tr>
								<td class="text-base-content/60">Bank Profit</td>
								<td>${Math.round(comparison.conventional.bankProfit).toLocaleString()}</td>
								<td>${Math.round(comparison.halal.bankProfit).toLocaleString()}</td>
							</tr>
							<tr>
								<td class="text-base-content/60">Ownership Structure</td>
								<td>100% ownership from start, with bank holding lien.</td>
								<td>Gradual increase from {downPaymentPercent}% to 100% ownership.</td>
							</tr>
							<tr>
								<td class="text-base-content/60">House Appreciation</td>
								<td colspan="2">
									${Math.round(comparison.house.initialValue).toLocaleString()} → ${Math.round(
										comparison.house.projectedValue,
									).toLocaleString()}
									(+${Math.round(comparison.house.appreciation).toLocaleString()}) after {termYears}
									years
								</td>
							</tr>
							<tr>
								<td class="text-base-content/60">Expected Gain After {termYears}Y</td>
								<td>${Math.round(comparison.conventional.netGain).toLocaleString()}</td>
								<td>${Math.round(comparison.halal.netGain).toLocaleString()}</td>
							</tr>
							<tr>
								<td class="text-base-content/60">Financial Advantage</td>
								<td colspan="2">{comparison.advantage.overallAdvantage}</td>
							</tr>
							<tr>
								<td class="text-base-content/60">Spiritual Advantage</td>
								<td colspan="2">
									With halal financing, you'll avoid interest (riba), bringing peace of mind and
									alignment with your religious values.
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
			<fieldset class="col-span-3 mt-6 fieldset rounded-box border border-base-content/20 p-4">
				<legend class="fieldset-legend text-base-content/50">
					{capitalize(viewMode)}ly Payment Breakdown
				</legend>

				<div class="overflow-x-auto">
					<table class="breakdown-table table table-sm">
						<thead>
							<tr>
								<th class="relative">
									<label class="absolute top-2 label cursor-pointer select-none">
										<div class="flex items-center gap-2">
											<span
												class={viewMode === "month" ? "text-base-content" : "text-base-content/50"}
											>
												Month
											</span>
											<input
												type="checkbox"
												class="toggle border-base-content text-base-content toggle-xs"
												onclick={toggleViewMode}
												checked={viewMode === "year"}
											/>
											<span
												class={viewMode === "year" ? "text-base-content" : "text-base-content/50"}
											>
												Year
											</span>
										</div>
									</label>
								</th>
								<th colspan="5" class="border-base-content/10 text-center">Conventional Loan</th>
								<th colspan="5" class="border-l border-base-content/10 text-center">
									Halal Financing
								</th>
							</tr>
							<tr>
								<th class="border-r border-base-content/10"></th>
								<th>Payment</th>
								<th>Interest</th>
								<th>Principal</th>
								<th>Start Bal.</th>
								<th>End Bal.</th>
								<th class="border-l border-base-content/10">Payment</th>
								<th>Rent</th>
								<th>Buyout</th>
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
										<td>${Math.round(record.conventional.beginningBalance).toLocaleString()}</td>
										<td>${Math.round(record.conventional.endingBalance).toLocaleString()}</td>
										<td class="border-l border-base-content/10">
											${Math.round(record.halal.totalPayment).toLocaleString()}
										</td>
										<td>${Math.round(record.halal.rentComponent).toLocaleString()}</td>
										<td>${Math.round(record.halal.buyoutComponent).toLocaleString()}</td>
										<td>${Math.round(record.halal.beginningBalance).toLocaleString()}</td>
										<td>${Math.round(record.halal.endingBalance).toLocaleString()}</td>
									{:else}
										<td>${Math.round(record.conventional.totalPayment).toLocaleString()}</td>
										<td>${Math.round(record.conventional.interestPaid).toLocaleString()}</td>
										<td>${Math.round(record.conventional.principalPaid).toLocaleString()}</td>
										<td>${Math.round(record.conventional.beginningBalance).toLocaleString()}</td>
										<td>${Math.round(record.conventional.endingBalance).toLocaleString()}</td>
										<td class="border-l border-base-content/10">
											${Math.round(record.halal.totalPayment).toLocaleString()}
										</td>
										<td>${Math.round(record.halal.rentComponent).toLocaleString()}</td>
										<td>${Math.round(record.halal.buyoutComponent).toLocaleString()}</td>
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
								type="range"
								min="1"
								max={Math.ceil(comparison.monthlyBreakdown.length / 12)}
								value={selectedYear}
								class="range flex-1 range-sm"
								step="1"
								oninput={handleYearChange}
							/>
							<span>Year {Math.ceil(comparison.monthlyBreakdown.length / 12)}</span>
						</div>
					</div>
				{/if}
			</fieldset>
		{/if}
	</div>
</div>

<footer class="bg-base-200 text-base-content/50">
	<div class="container mx-auto footer w-5xl min-w-5xl footer-horizontal items-center px-4 py-8">
		<aside class="grid-flow-col items-center">
			<p class="text-xs">
				Developed by <a
					href="http://www.mislam.dev"
					class="font-semibold transition-colors hover:text-base-content"
				>
					Mohammad Islam
				</a>
				&copy; {new Date().getFullYear()}
			</p>
		</aside>
		<nav class="grid-flow-col gap-4 justify-self-end">
			<a
				href="https://www.linkedin.com/in/mohammadislm/"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="LinkedIn profile"
				class="transition-colors hover:text-base-content"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					class="fill-current"
				>
					<path
						d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
					></path>
				</svg>
			</a>
			<a
				href="https://github.com/mislam"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub profile"
				class="transition-colors hover:text-base-content"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					class="fill-current"
				>
					<path
						d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
					></path>
				</svg>
			</a>
			<a
				href="http://www.mislam.dev"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Personal website"
				class="transition-colors hover:text-base-content"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					class="fill-current"
				>
					<path
						d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.057v-3.057h2.994c-.059 1.143-.212 2.24-.456 3.279-.823-.12-1.674-.188-2.538-.222zm1.957 2.162c-.499 1.33-1.159 2.497-1.957 3.456v-3.62c.666.028 1.319.081 1.957.164zm-1.957-7.219v-3.015c.868-.034 1.721-.103 2.548-.224.238 1.027.389 2.111.446 3.239h-2.994zm0-5.014v-3.661c.806.969 1.471 2.15 1.971 3.496-.642.084-1.3.137-1.971.165zm2.703-3.267c1.237.496 2.354 1.228 3.29 2.146-.642.234-1.311.442-2.019.607-.344-.992-.775-1.91-1.271-2.753zm-7.241 13.56c-.244-1.039-.398-2.136-.456-3.279h2.994v3.057c-.865.034-1.714.102-2.538.222zm2.538 1.776v3.62c-.798-.959-1.458-2.126-1.957-3.456.638-.083 1.291-.136 1.957-.164zm-2.994-7.055c.057-1.128.207-2.212.446-3.239.827.121 1.68.19 2.548.224v3.015h-2.994zm1.024-5.179c.5-1.346 1.165-2.527 1.97-3.496v3.661c-.671-.028-1.329-.081-1.97-.165zm-2.005-.35c-.708-.165-1.377-.373-2.018-.607.937-.918 2.053-1.65 3.29-2.146-.496.844-.927 1.762-1.272 2.753zm-.549 1.918c-.264 1.151-.434 2.36-.492 3.611h-3.933c.165-1.658.739-3.197 1.617-4.518.88.361 1.816.67 2.808.907zm.009 9.262c-.988.236-1.92.542-2.797.9-.89-1.328-1.471-2.879-1.637-4.551h3.934c.058 1.265.231 2.488.5 3.651zm.553 1.917c.342.976.768 1.881 1.257 2.712-1.223-.49-2.326-1.211-3.256-2.115.636-.229 1.299-.435 1.999-.597zm9.924 0c.7.163 1.362.367 1.999.597-.931.903-2.034 1.625-3.257 2.116.489-.832.915-1.737 1.258-2.713zm.553-1.917c.27-1.163.442-2.386.501-3.651h3.934c-.167 1.672-.748 3.223-1.638 4.551-.877-.358-1.81-.664-2.797-.9zm.501-5.651c-.058-1.251-.229-2.46-.492-3.611.992-.237 1.929-.546 2.809-.907.877 1.321 1.451 2.86 1.616 4.518h-3.933z"
					></path>
				</svg>
			</a>
		</nav>
	</div>
</footer>

<style lang="postcss">
	@reference "tailwindcss";

	input[type="number"] {
		@apply text-right;
	}
	legend {
		@apply px-1 py-0 text-center;
	}
	th {
		@apply font-normal;
	}
	td:first-child {
		@apply align-top;
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
