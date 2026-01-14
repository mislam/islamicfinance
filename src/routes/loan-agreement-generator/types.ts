export interface Witness {
	fullName: string
	address: string
	phone: string
	email: string
	gender: string // "male" or "female"
}

export interface ContractData {
	borrower: {
		fullName: string
		address: string
		phone: string
		email: string
	}
	lender: {
		fullName: string
		address: string
		phone: string
		email: string
	}
	loan: {
		amount: number
		currency: string // ISO 4217 currency code (e.g., "USD", "EUR", "GBP")
		purpose: string
		loanDate: string // ISO date string
		repaymentDate: string // ISO date string
	}
	witnesses: Witness[]
}
