/**
 * Housing finance calculation utilities
 */

import type { MonthlyRecord, MortgageResult, YearlyRecord } from "./types"

// Export singleton calculator instance
export const calc = new (class {
	/**
	 * Calculate fair market rent based on home value and annual rental rate
	 * @param homeValue Current home value
	 * @param annualRentalRate Annual rental rate (%)
	 * @returns Monthly fair market rent
	 */
	fairMarketRent(homeValue: number, annualRentalRate: number): number {
		return Math.round(homeValue * (annualRentalRate / 12 / 100))
	}

	/**
	 * Calculate monthly buyout amount to purchase bank's share in halal financing
	 * @param principal Financing amount (bank's share)
	 * @param years Financing term in years
	 * @returns Monthly buyout payment
	 */
	monthlyBuyout(principal: number, years: number): number {
		return Math.round(principal / (years * 12))
	}

	/**
	 * Calculate full financing comparison results
	 * @param homePrice Home purchase price
	 * @param downPaymentPercent Down payment percentage
	 * @param termYears Loan term in years
	 * @param interestRate Conventional interest rate (%)
	 * @param monthlyBuyout Monthly buyout amount
	 * @param annualRentalRate Annual rental rate (%)
	 * @param annualHomeGrowth Annual home price appreciation rate (%)
	 * @param annualRentGrowth Annual rental rate appreciation rate (%)
	 * @param annualPropertyTaxRate Annual property tax rate (%)
	 * @param annualInsuranceRate Annual insurance rate (%)
	 * @returns Mortgage comparison results
	 */
	mortgageComparison(
		homePrice: number,
		downPaymentPercent: number,
		termYears: number,
		interestRate: number,
		monthlyBuyout: number,
		annualRentalRate: number,
		annualHomeGrowth: number,
		annualRentGrowth: number,
		annualPropertyTaxRate: number,
		annualInsuranceRate: number,
	): MortgageResult {
		const months = termYears * 12
		const loanAmount = homePrice * (1 - downPaymentPercent / 100)
		const downPayment = homePrice * (downPaymentPercent / 100)

		// 1. Conventional Loan Calculations
		const monthlyInterestRate = interestRate / 100 / 12
		const monthlyPayment =
			(loanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -months))

		// Calculate total insurance and tax over the loan term (will be calculated monthly with appreciation)
		// For summary calculations, use average home value
		const averageHomeValue = homePrice * (1 + annualHomeGrowth / 100) ** (termYears / 2)
		const totalInsurance = ((averageHomeValue * annualInsuranceRate) / 100) * termYears
		const totalPropertyTax = ((averageHomeValue * annualPropertyTaxRate) / 100) * termYears

		const monthlyInsuranceAvg = totalInsurance / months
		const monthlyPropertyTaxAvg = totalPropertyTax / months
		const totalPaymentsConventional = monthlyPayment * months + totalInsurance + totalPropertyTax
		const averageMonthlyPaymentConventional =
			monthlyPayment + monthlyInsuranceAvg + monthlyPropertyTaxAvg
		const bankProfitConventional = monthlyPayment * months - loanAmount

		// 2. Halal (Diminishing Musharaka) Calculations
		let totalRentPaid = 0
		let totalBankInsurancePaid = 0
		let totalBankPropertyTaxPaid = 0
		let totalHalalInsurance = 0
		let totalHalalPropertyTax = 0
		let averageRent = 0

		// Interest/rent starts accruing immediately after closing
		// First payment is due at the end of month 1
		// We'll calculate using the same logic as monthly breakdown for consistency
		let halalBalanceForSummary = loanAmount
		for (let i = 0; i < months; i++) {
			// Calculate which year we're in (0-indexed)
			const currentYear = Math.floor(i / 12)

			// Calculate current home value with appreciation
			const currentHomeValueForMonth = homePrice * Math.pow(1 + annualHomeGrowth / 100, currentYear)

			// Calculate monthly insurance and property tax (grows with home appreciation)
			const monthlyInsuranceForMonth = (currentHomeValueForMonth * annualInsuranceRate) / 100 / 12
			const monthlyPropertyTaxForMonth =
				(currentHomeValueForMonth * annualPropertyTaxRate) / 100 / 12

			// Calculate ownership percentages (same logic as monthly breakdown)
			const tenantOwnership = (homePrice - halalBalanceForSummary) / homePrice
			const bankOwnership = halalBalanceForSummary / homePrice
			const tenantOwnershipPercent = Math.max(0, Math.min(tenantOwnership, 1.0))
			const bankOwnershipPercent = Math.max(0, Math.min(bankOwnership, 1.0))

			// Apply annual rent growth at the beginning of each year
			const rentThisMonth =
				halalBalanceForSummary *
				(annualRentalRate / 100 / 12) *
				Math.pow(1 + annualRentGrowth / 100, currentYear)

			totalRentPaid += rentThisMonth

			// Calculate bank's and tenant's share of insurance and tax
			totalBankInsurancePaid += monthlyInsuranceForMonth * bankOwnershipPercent
			totalBankPropertyTaxPaid += monthlyPropertyTaxForMonth * bankOwnershipPercent
			totalHalalInsurance += monthlyInsuranceForMonth * tenantOwnershipPercent
			totalHalalPropertyTax += monthlyPropertyTaxForMonth * tenantOwnershipPercent

			// Update balance for next iteration (buyout happens after rent calculation)
			halalBalanceForSummary -= monthlyBuyout
			if (halalBalanceForSummary < 0) halalBalanceForSummary = 0
		}

		averageRent = totalRentPaid / months
		const totalPaymentsHalal =
			totalRentPaid + loanAmount + totalHalalInsurance + totalHalalPropertyTax
		const averageMonthlyHalalPayment =
			averageRent + monthlyBuyout + (totalHalalInsurance + totalHalalPropertyTax) / months
		// Bank profit = rent income - bank's expenses (insurance + tax)
		const bankProfitHalal = totalRentPaid - totalBankInsurancePaid - totalBankPropertyTaxPaid

		// 3. House Value Appreciation
		const projectedValue = homePrice * Math.pow(1 + annualHomeGrowth / 100, termYears)
		const appreciation = projectedValue - homePrice

		// 4. Advantage Calculation
		const netGainHalal = projectedValue - totalPaymentsHalal - downPayment
		const netGainConventional = projectedValue - totalPaymentsConventional - downPayment

		// The difference in net gain between the two options
		const netWealthPosition = netGainHalal - netGainConventional

		// Determine which option has the advantage and by how much
		const advantageAmount = Math.abs(netWealthPosition)
		const betterOption =
			netWealthPosition > 0 ? "Halal" : netWealthPosition < 0 ? "Conventional" : "Equal"

		// Generate a descriptive advantage summary with personal touch
		const overallAdvantage =
			netWealthPosition > 0
				? `After ${termYears} years with your chosen market conditions, you'll save $${Math.round(advantageAmount).toLocaleString()} more with halal financing.`
				: netWealthPosition < 0
					? `After ${termYears} years with your chosen market conditions, you'll save $${Math.round(advantageAmount).toLocaleString()} more with interest-based financing.`
					: "Both financing options offer you the same financial outcome."

		// 5. Generate month-by-month and year-by-year breakdown
		const monthlyBreakdown: MonthlyRecord[] = []
		const yearlyBreakdown: YearlyRecord[] = []

		let conventionalRemainingBalance = loanAmount
		let halalRemainingBalance = loanAmount

		// Track yearly totals
		let yearlyConventionalInterest = 0
		let yearlyConventionalPrincipal = 0
		let yearlyConventionalInsurance = 0
		let yearlyConventionalPropertyTax = 0
		let yearlyHalalRent = 0
		let yearlyHalalBuyout = 0
		let yearlyHalalInsurance = 0
		let yearlyHalalPropertyTax = 0
		let yearlyStartConventionalBalance = conventionalRemainingBalance
		let yearlyStartHalalBalance = halalRemainingBalance

		// Payments start at the end of the first month (month=0), so we track by
		// payment number (1-based) even though calculation is for the previous month
		for (let month = 0; month < months; month++) {
			const paymentNumber = month + 1

			// Calculate which year we're in (0-indexed)
			const currentYear = Math.floor(month / 12)

			// Store the beginning balance for this month (before payment)
			const conventionalBeginningBalance = conventionalRemainingBalance
			const halalBeginningBalance = halalRemainingBalance

			// Calculate current home value with appreciation
			const currentHomeValue = homePrice * Math.pow(1 + annualHomeGrowth / 100, currentYear)

			// Calculate monthly insurance and property tax (grows with home appreciation)
			const monthlyInsurance = (currentHomeValue * annualInsuranceRate) / 100 / 12
			const monthlyPropertyTax = (currentHomeValue * annualPropertyTaxRate) / 100 / 12

			// Conventional loan calculations
			// Interest accrues on current balance during the month
			// then payment is made at month end
			// Tenant pays 100% of insurance and property tax
			const interestPayment = conventionalRemainingBalance * monthlyInterestRate
			const principalPayment = monthlyPayment - interestPayment
			const conventionalInsurancePaid = monthlyInsurance
			const conventionalPropertyTaxPaid = monthlyPropertyTax
			const conventionalTotalPayment = monthlyPayment + monthlyInsurance + monthlyPropertyTax

			// Halal financing calculations
			// Rent is paid on the bank's current ownership share
			// Apply annual rent growth at the beginning of each year
			const rent =
				halalRemainingBalance *
				(annualRentalRate / 100 / 12) *
				Math.pow(1 + annualRentGrowth / 100, currentYear)

			// Calculate ownership percentages for halal
			// Tenant's ownership = (homePrice - bank's remaining balance) / homePrice
			// Bank's ownership = remainingBalance / homePrice
			const tenantOwnership = (homePrice - halalRemainingBalance) / homePrice
			// const bankOwnership = halalRemainingBalance / homePrice
			// Ensure percentages don't exceed 1.0 and are non-negative
			const tenantOwnershipPercent = Math.max(0, Math.min(tenantOwnership, 1.0))
			// const bankOwnershipPercent = Math.max(0, Math.min(bankOwnership, 1.0))

			// Split insurance and tax proportionally based on ownership
			const halalInsurancePaid = monthlyInsurance * tenantOwnershipPercent
			const halalPropertyTaxPaid = monthlyPropertyTax * tenantOwnershipPercent

			const thisMonthHalalPayment = rent + monthlyBuyout + halalInsurancePaid + halalPropertyTaxPaid

			// Apply payments to reduce balances
			conventionalRemainingBalance -= principalPayment
			if (conventionalRemainingBalance < 0) conventionalRemainingBalance = 0

			halalRemainingBalance -= monthlyBuyout
			if (halalRemainingBalance < 0) halalRemainingBalance = 0

			// Store the ending balance for this month (after payment)
			const conventionalEndingBalance = conventionalRemainingBalance
			const halalEndingBalance = halalRemainingBalance

			// Track yearly totals
			yearlyConventionalInterest += interestPayment
			yearlyConventionalPrincipal += principalPayment
			yearlyConventionalInsurance += conventionalInsurancePaid
			yearlyConventionalPropertyTax += conventionalPropertyTaxPaid
			yearlyHalalRent += rent
			yearlyHalalBuyout += monthlyBuyout
			yearlyHalalInsurance += halalInsurancePaid
			yearlyHalalPropertyTax += halalPropertyTaxPaid

			// Include all months in monthly breakdown for complete pagination
			monthlyBreakdown.push({
				month: paymentNumber, // Payment number (1-based)
				conventional: {
					totalPayment: conventionalTotalPayment,
					beginningBalance: conventionalBeginningBalance,
					endingBalance: conventionalEndingBalance,
					interestPaid: interestPayment,
					principalPaid: principalPayment,
					insurancePaid: conventionalInsurancePaid,
					propertyTaxPaid: conventionalPropertyTaxPaid,
				},
				halal: {
					totalPayment: thisMonthHalalPayment,
					rentComponent: rent,
					buyoutComponent: monthlyBuyout,
					beginningBalance: halalBeginningBalance,
					endingBalance: halalEndingBalance,
					insurancePaid: halalInsurancePaid,
					propertyTaxPaid: halalPropertyTaxPaid,
					tenantOwnershipPercent: tenantOwnershipPercent * 100, // Convert to percentage
				},
			})

			// At the end of each year, add yearly totals
			if (paymentNumber % 12 === 0) {
				const year = paymentNumber / 12
				yearlyBreakdown.push({
					year,
					conventional: {
						totalPayment:
							yearlyConventionalInterest +
							yearlyConventionalPrincipal +
							yearlyConventionalInsurance +
							yearlyConventionalPropertyTax,
						beginningBalance: yearlyStartConventionalBalance,
						endingBalance: conventionalEndingBalance,
						interestPaid: yearlyConventionalInterest,
						principalPaid: yearlyConventionalPrincipal,
						insurancePaid: yearlyConventionalInsurance,
						propertyTaxPaid: yearlyConventionalPropertyTax,
					},
					halal: {
						totalPayment:
							yearlyHalalRent + yearlyHalalBuyout + yearlyHalalInsurance + yearlyHalalPropertyTax,
						rentComponent: yearlyHalalRent,
						buyoutComponent: yearlyHalalBuyout,
						beginningBalance: yearlyStartHalalBalance,
						endingBalance: halalEndingBalance,
						insurancePaid: yearlyHalalInsurance,
						propertyTaxPaid: yearlyHalalPropertyTax,
						tenantOwnershipPercent: ((homePrice - halalEndingBalance) / homePrice) * 100, // Ending ownership at year end
					},
				})

				// Reset yearly counters and track starting balances for next year
				yearlyConventionalInterest = 0
				yearlyConventionalPrincipal = 0
				yearlyConventionalInsurance = 0
				yearlyConventionalPropertyTax = 0
				yearlyHalalRent = 0
				yearlyHalalBuyout = 0
				yearlyHalalInsurance = 0
				yearlyHalalPropertyTax = 0
				yearlyStartConventionalBalance = conventionalEndingBalance
				yearlyStartHalalBalance = halalEndingBalance
			}
		}

		return {
			loanAmount,
			conventional: {
				averageMonthlyPayment: averageMonthlyPaymentConventional,
				totalPayments: totalPaymentsConventional,
				totalCost: totalPaymentsConventional + downPayment,
				bankProfit: bankProfitConventional,
				netGain: netGainConventional,
			},
			halal: {
				averageMonthlyPayment: averageMonthlyHalalPayment,
				rentComponent: averageRent,
				totalPayments: totalPaymentsHalal,
				totalCost: totalPaymentsHalal + downPayment,
				bankProfit: bankProfitHalal,
				bankInsurancePaid: totalBankInsurancePaid,
				bankPropertyTaxPaid: totalBankPropertyTaxPaid,
				netGain: netGainHalal,
			},
			house: {
				initialValue: homePrice,
				projectedValue,
				appreciation,
			},
			advantage: {
				netWealthPosition,
				overallAdvantage,
				advantageAmount,
				betterOption,
			},
			monthlyBreakdown,
			yearlyBreakdown,
		}
	}
})()
