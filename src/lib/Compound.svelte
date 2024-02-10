<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { compoundAsHTML, getAtomicMassFromString } from './periodic';

	export let compound: string = '';
	export let index: number;
	export let masses: Writable<number[]> = writable([]);
	export let limitingReagent: string = '';

	let molesInput = '';

	function unitToMole() {
		let mass = getAtomicMassFromString(compound);
		switch (molesInput.slice(-1)) {
			case 'g':
				return parseFloat(molesInput.slice(0, -1)) / mass;
			case 'l':
				return parseFloat(molesInput.slice(0, -1)) / 22.4;
			case 'm':
				return parseFloat(molesInput.slice(0, -1));
			case 'a':
				return parseFloat(molesInput.slice(0, -1)) / 6.022e23;
			default:
				return parseFloat(molesInput.slice(0, -1)) / mass;
		}
	}

	let border: string = 'border-slate-800';
	$: {
		if (limitingReagent == compound) {
			border = 'border-zinc-500';
		} else {
			border = 'border-slate-800';
		}
	}
</script>

<div
	class="flex flex-col items-center justify-center rounded-xl border-2 {border} bg-slate-900 p-4"
>
	<h2 class="font-bold text-zinc-300">{@html compoundAsHTML(compound)}</h2>
	<p class="mb-2 text-zinc-400">{getAtomicMassFromString(compound).toFixed(2)} g/mol</p>
	<input
		class="w-32 rounded-xl bg-slate-700 p-1 text-center text-white ring-2 ring-slate-600"
		bind:value={molesInput}
		on:input={() => masses.update((arr) => {
			arr[index] = unitToMole();
			return arr;
		})}
		placeholder="g, l, m, a"
	/>
</div>
