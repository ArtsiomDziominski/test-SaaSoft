<template>
	<v-container class="py-6">
		<div class="d-flex align-center justify-space-between mb-4">
			<h2 class="text-h5 m-0">Учетные записи</h2>
			<v-btn color="primary" prepend-icon="mdi-plus" @click="addAccount">
				Добавить
			</v-btn>
		</div>

		<label-hint />

		<div v-if="accounts.length === 0" class="text-medium-emphasis mb-4">
			Нет записей. Нажмите «Добавить».
		</div>

		<account-item
			v-for="acc in accounts"
			:key="acc.id"
			v-model="bufferById[acc.id]"
			@update:model-value="onUpdateModel(acc.id, $event)"
			@remove="removeAccount"
		/>
	</v-container>
</template>

<script setup lang="ts">
import { computed, reactive, watchEffect } from 'vue'
import AccountItem from './AccountItem.vue'
import LabelHint from './LabelHint.vue'
import { useAccountsStore } from '../stores/accounts'
import type { AccountRecord } from '../types/accounts'

const store = useAccountsStore()

// We keep a local editable buffer per id to allow v-model on child without mutating store directly
const bufferById = reactive<Record<string, AccountRecord>>({})

const accounts = computed(() => store.accounts)

watchEffect(() => {
	// ensure buffers mirror current store state
	for (const acc of store.accounts) {
		if (!bufferById[acc.id]) bufferById[acc.id] = { ...acc }
		else bufferById[acc.id] = { ...acc }
	}
	// prune stale buffers
	for (const id of Object.keys(bufferById)) {
		if (!store.accounts.find((a: AccountRecord) => a.id === id)) {
			delete bufferById[id]
		}
	}
})

function addAccount(): void {
	const acc = store.addEmpty()
	bufferById[acc.id] = { ...acc }
}

function removeAccount(id: string): void {
	delete bufferById[id]
	store.removeById(id)
}

// Commit handler from child when valid
function onUpdateModel(id: string, value: AccountRecord): void {
	bufferById[id] = { ...value }
	store.updatePartial(id, value)
}

</script>



