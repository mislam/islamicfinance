export interface MonthlyRecord {
	month: number
	conventional: {
		totalPayment: number
		beginningBalance: number
		endingBalance: number
		interestPaid: number
		principalPaid: number
	}
	halal: {
		totalPayment: number
		rentComponent: number
		buyoutComponent: number
		beginningBalance: number
		endingBalance: number
	}
}

export interface YearlyRecord {
	year: number
	conventional: {
		totalPayment: number
		beginningBalance: number
		endingBalance: number
		interestPaid: number
		principalPaid: number
	}
	halal: {
		totalPayment: number
		rentComponent: number
		buyoutComponent: number
		beginningBalance: number
		endingBalance: number
	}
}

export interface MortgageResult {
	loanAmount: number
	conventional: {
		averageMonthlyPayment: number
		totalPayments: number
		totalCost: number
		bankProfit: number
		netGain: number
	}
	halal: {
		averageMonthlyPayment: number
		rentComponent: number
		totalPayments: number
		totalCost: number
		bankProfit: number
		netGain: number
	}
	house: {
		initialValue: number
		projectedValue: number
		appreciation: number
	}
	advantage: {
		netWealthPosition: number
		overallAdvantage: string
		advantageAmount: number
		betterOption: string
	}
	monthlyBreakdown: MonthlyRecord[]
	yearlyBreakdown: YearlyRecord[]
}
