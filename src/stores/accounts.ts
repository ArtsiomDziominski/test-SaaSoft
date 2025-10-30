import { defineStore } from 'pinia'
import type { AccountRecord } from '@/types/accounts'
import { createEmptyAccount, parseLabelInputToTokens } from '@/types/accounts'

const STORAGE_KEY = 'accounts_store_v1'

function loadFromStorage(): AccountRecord[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return []
		const parsed: AccountRecord[] = JSON.parse(raw)
		return parsed.map((a) => ({
			...a,
			// defensive: ensure password follows type rules
			password: a.type === 'LDAP' ? null : a.password ?? '',
		}))
	} catch {
		return []
	}
}

function saveToStorage(accounts: AccountRecord[]): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
}

export const useAccountsStore = defineStore('accounts', {
	state: () => ({
		accounts: loadFromStorage() as AccountRecord[],
	}),
	actions: {
		addEmpty(): AccountRecord {
			const account = createEmptyAccount()
			this.accounts.push(account)
			saveToStorage(this.accounts)
			return account
		},
		removeById(id: string): void {
			this.accounts = this.accounts.filter((a) => a.id !== id)
			saveToStorage(this.accounts)
		},
		updatePartial(id: string, patch: Partial<AccountRecord>): void {
			const idx = this.accounts.findIndex((a) => a.id === id)
			if (idx === -1) return
			const current = this.accounts[idx]
			const next: AccountRecord = { ...current, ...patch }
			// enforce derived fields and business rules
			next.labels = parseLabelInputToTokens(next.labelInput)
			next.password = next.type === 'LDAP' ? null : (next.password ?? '')
			this.accounts.splice(idx, 1, next)
			saveToStorage(this.accounts)
		},
		replaceAll(accounts: AccountRecord[]): void {
			this.accounts = accounts
			saveToStorage(this.accounts)
		},
	},
})


