export type AccountType = 'LDAP' | 'Local';

export interface LabelToken {
	text: string;
}

export interface AccountRecord {
	id: string;
	labelInput: string; // raw input with semicolon-separated labels
	labels: LabelToken[]; // derived from labelInput
	type: AccountType;
	login: string;
	password: string | null; // null for LDAP
}

export interface AccountValidationState {
	labelInput?: string;
	type?: string;
	login?: string;
	password?: string;
}

export const ACCOUNT_TYPE_OPTIONS: { label: string; value: AccountType }[] = [
	{ label: 'LDAP', value: 'LDAP' },
	{ label: 'Локальная', value: 'Local' },
];

export function parseLabelInputToTokens(input: string): LabelToken[] {
	return input
		.split(';')
		.map((s) => s.trim())
		.filter((s) => s.length > 0)
		.map((s) => ({ text: s }));
}

export function createEmptyAccount(): AccountRecord {
	return {
		id: crypto.randomUUID(),
		labelInput: '',
		labels: [],
		type: 'LDAP',
		login: '',
		password: null,
	};
}


