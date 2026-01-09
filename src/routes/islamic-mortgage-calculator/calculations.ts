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
	): MortgageResult {
		const months = termYears * 12
		const loanAmount = homePrice * (1 - downPaymentPercent / 100)
		const downPayment = homePrice * (downPaymentPercent / 100)

		// 1. Conventional Loan Calculations
		const monthlyInterestRate = interestRate / 100 / 12
		const monthlyPayment =
			(loanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -months))
		const totalPaymentsConventional = monthlyPayment * months
		const bankProfitConventional = totalPaymentsConventional - loanAmount

		// 2. Halal (Diminishing Musharaka) Calculations
		let totalRentPaid = 0
		let averageRent = 0

		// Interest/rent starts accruing immediately after closing
		// First payment is due at the end of month 1
		for (let i = 0; i < months; i++) {
			// Calculate which year we're in (0-indexed)
			const currentYear = Math.floor(i / 12)

			// For month 0, bankShare is full loanAmount, but payment happens at end of month 1
			const bankShare = loanAmount - i * monthlyBuyout

			// Apply annual rent growth at the beginning of each year
			const rentThisMonth =
				bankShare *
				(annualRentalRate / 100 / 12) *
				Math.pow(1 + annualRentGrowth / 100, currentYear)

			totalRentPaid += rentThisMonth
		}

		averageRent = totalRentPaid / months
		const totalPaymentsHalal = totalRentPaid + loanAmount
		const averageMonthlyHalalPayment = averageRent + monthlyBuyout
		const bankProfitHalal = totalRentPaid

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
				? `After ${termYears} years with your chosen market conditions, you'll gain $${Math.round(advantageAmount).toLocaleString()} more with halal financing.`
				: netWealthPosition < 0
					? `After ${termYears} years with your chosen market conditions, you'll gain $${Math.round(advantageAmount).toLocaleString()} more with interest-based financing.`
					: "Both financing options offer you the same financial outcome."

		// 5. Generate month-by-month and year-by-year breakdown
		const monthlyBreakdown: MonthlyRecord[] = []
		const yearlyBreakdown: YearlyRecord[] = []

		let conventionalRemainingBalance = loanAmount
		let halalRemainingBalance = loanAmount

		// Track yearly totals
		let yearlyConventionalInterest = 0
		let yearlyConventionalPrincipal = 0
		let yearlyHalalRent = 0
		let yearlyHalalBuyout = 0
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

			// Conventional loan calculations
			// Interest accrues on current balance during the month
			// then payment is made at month end
			const interestPayment = conventionalRemainingBalance * monthlyInterestRate
			const principalPayment = monthlyPayment - interestPayment

			// Halal financing calculations
			// Rent is paid on the bank's current ownership share
			// Apply annual rent growth at the beginning of each year
			const rent =
				halalRemainingBalance *
				(annualRentalRate / 100 / 12) *
				Math.pow(1 + annualRentGrowth / 100, currentYear)

			const thisMonthHalalPayment = rent + monthlyBuyout

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
			yearlyHalalRent += rent
			yearlyHalalBuyout += monthlyBuyout

			// Include all months in monthly breakdown for complete pagination
			monthlyBreakdown.push({
				month: paymentNumber, // Payment number (1-based)
				conventional: {
					totalPayment: monthlyPayment,
					beginningBalance: conventionalBeginningBalance,
					endingBalance: conventionalEndingBalance,
					interestPaid: interestPayment,
					principalPaid: principalPayment,
				},
				halal: {
					totalPayment: thisMonthHalalPayment,
					rentComponent: rent,
					buyoutComponent: monthlyBuyout,
					beginningBalance: halalBeginningBalance,
					endingBalance: halalEndingBalance,
				},
			})

			// At the end of each year, add yearly totals
			if (paymentNumber % 12 === 0) {
				const year = paymentNumber / 12
				yearlyBreakdown.push({
					year,
					conventional: {
						totalPayment: yearlyConventionalInterest + yearlyConventionalPrincipal,
						beginningBalance: yearlyStartConventionalBalance,
						endingBalance: conventionalEndingBalance,
						interestPaid: yearlyConventionalInterest,
						principalPaid: yearlyConventionalPrincipal,
					},
					halal: {
						totalPayment: yearlyHalalRent + yearlyHalalBuyout,
						rentComponent: yearlyHalalRent,
						buyoutComponent: yearlyHalalBuyout,
						beginningBalance: yearlyStartHalalBalance,
						endingBalance: halalEndingBalance,
					},
				})

				// Reset yearly counters and track starting balances for next year
				yearlyConventionalInterest = 0
				yearlyConventionalPrincipal = 0
				yearlyHalalRent = 0
				yearlyHalalBuyout = 0
				yearlyStartConventionalBalance = conventionalEndingBalance
				yearlyStartHalalBalance = halalEndingBalance
			}
		}

		return {
			loanAmount,
			conventional: {
				averageMonthlyPayment: monthlyPayment,
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
