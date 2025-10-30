<template>
	<v-card class="mb-4" variant="outlined">
		<v-card-text>
			<v-row dense>
				<v-col cols="12" md="4">
					<v-text-field
						label="Метка"
						v-model="local.labelInput"
						:maxlength="50"
						@blur="onBlurLabel"
						:error="!!errors.labelInput"
						:error-messages="errors.labelInput || ''"
					></v-text-field>
				</v-col>
				<v-col cols="12" md="3">
					<v-select
						label="Тип записи"
						:items="typeOptions"
						item-title="label"
						item-value="value"
						v-model="local.type"
						@update:model-value="onChangeType"
						:error="!!errors.type"
						:error-messages="errors.type || ''"
					></v-select>
				</v-col>
				<v-col cols="12" md="3">
					<v-text-field
						label="Логин"
						v-model="local.login"
						:maxlength="100"
						@blur="onBlurLogin"
						:error="!!errors.login"
						:error-messages="errors.login || ''"
						autocomplete="username"
					></v-text-field>
				</v-col>
				<v-col cols="12" md="2" v-if="local.type === 'Local'">
					<v-text-field
						label="Пароль"
						type="password"
						v-model="local.passwordInput"
						:maxlength="100"
						@blur="onBlurPassword"
						:error="!!errors.password"
						:error-messages="errors.password || ''"
						autocomplete="current-password"
					></v-text-field>
				</v-col>
				<v-col cols="12" md="12" class="d-flex justify-end">
					<v-btn icon="mdi-delete" color="error" variant="tonal" @click="$emit('remove', id)"></v-btn>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { AccountRecord, AccountValidationState } from '../types/accounts'
import { ACCOUNT_TYPE_OPTIONS } from '../types/accounts'

const props = defineProps<{
	modelValue: AccountRecord
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', value: AccountRecord): void
	(e: 'remove', id: string): void
}>()

const id = computed(() => props.modelValue.id)
const typeOptions = ACCOUNT_TYPE_OPTIONS

// local working copy for v-model inputs
const local = reactive({
	labelInput: props.modelValue.labelInput,
	type: props.modelValue.type,
	login: props.modelValue.login,
	passwordInput: props.modelValue.password ?? '',
})

watch(
	() => props.modelValue,
	(next) => {
		local.labelInput = next.labelInput
		local.type = next.type
		local.login = next.login
		local.passwordInput = next.password ?? ''
	},
	{ deep: true }
)

const errors = reactive<AccountValidationState>({})

function validate(): boolean {
	errors.labelInput = undefined // label optional, only length rule
	if (local.labelInput.length > 50) {
		errors.labelInput = 'Максимум 50 символов'
	}
	errors.type = !local.type ? 'Укажите тип записи' : undefined
	errors.login = !local.login
		? 'Обязательное поле'
		: local.login.length > 100
		? 'Максимум 100 символов'
		: undefined
	if (local.type === 'Local') {
		errors.password = !local.passwordInput
			? 'Обязательное поле'
			: local.passwordInput.length > 100
			? 'Максимум 100 символов'
			: undefined
	} else {
		errors.password = undefined
	}
	return !errors.type && !errors.login && !errors.password && !errors.labelInput
}

function commitIfValid(): void {
	if (!validate()) return
	const next: AccountRecord = {
		...props.modelValue,
		labelInput: local.labelInput,
		type: local.type,
		login: local.login,
		password: local.type === 'LDAP' ? null : local.passwordInput,
	}
	emit('update:modelValue', next)
}

function onBlurLabel() {
	commitIfValid()
}

function onBlurLogin() {
	commitIfValid()
}

function onBlurPassword() {
	commitIfValid()
}

function onChangeType() {
	// when switching to LDAP, clear password input view-state
	if (local.type === 'LDAP') {
		local.passwordInput = ''
	}
	commitIfValid()
}
</script>


