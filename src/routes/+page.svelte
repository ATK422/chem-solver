<script lang="ts">
	import { getAtomicMassFromString } from '$lib/periodic';
	import { onDestroy, onMount } from 'svelte';
	import Compound from '$lib/Compound.svelte';
	import { writable, type Writable } from 'svelte/store';

	let equation: string = '';
	let display: string = '';

	let masses: Writable<number[]> = writable([]);

	let cursorPosition = 0;

	function replaceNumbersAfterLetters(text: string): string {
		text =
			text.slice(0, cursorPosition) + '<span class="caret"></span>' + text.slice(cursorPosition);
		text = text.replace(/(?<!<[^>]*)>/g, ' → ');
		text = text.replace(/(\w|\)|\>)(\d)/g, (_, letter, number) => `${letter}<sub>${number}</sub>`);
		return text.replaceAll('+', ' + ');
	}

	function splitEquation(equation: string): string[] {
		let split = equation.split(/(\+|->|\(|\))/);
		return split.filter((s) => s != '' && s != '+' && s != '->' && s != '(' && s != ')');
	}

	function getReactants(equation: string): string[] {
		return equation.split('>')[0].split('+');
	}

	function getProducts(equation: string): string[] {
		let split = equation.split('>');
		if (split.length == 1) return [];
		return equation.split('>')[1].split('+');
	}

	//Calculate limiting reagent using parralel arrays
	function getLimitingReagent(): { reagent: string; moles: number } {
		let reactants = getReactants(equation);
		let products = getProducts(equation);
		let reactantMoles = reactants.map((compound) => {
			return getAtomicMassFromString(compound);
		});
		let productMoles = products.map((compound) => {
			return getAtomicMassFromString(compound);
		});
		let limitingReagent = '';
		let min = Infinity;
		for (let i = 0; i < reactantMoles.length; i++) {
			if ($masses[i] / reactantMoles[i] < min) {
				min = $masses[i] / reactantMoles[i];
				limitingReagent = reactants[i];
			}
		}

		return { reagent: limitingReagent, moles: min };
	}

	let limitingReagent = '';
	let limitingReagentMoles = 0;
	$ : masses.subscribe((arr) => {
		const { reagent, moles } = getLimitingReagent();

		limitingReagent = reagent;
		limitingReagentMoles = moles;
	});

	let mass = '';
	function update() {
		display = replaceNumbersAfterLetters(equation);
		mass = splitEquation(equation)
			.map((compound) => {
				return getAtomicMassFromString(compound);
			})
			.reduce((a, b) => a + b, 0)
			.toFixed(2);
	}

	const keydown = (event: KeyboardEvent) => {
		if (document.activeElement !== document.body) return;

		if (event.key == 'Backspace') {
			equation = equation.slice(0, cursorPosition - 1) + equation.slice(cursorPosition);
			cursorPosition = Math.max(0, cursorPosition - 1);
		}

		if (event.key == 'ArrowLeft') {
			cursorPosition = Math.max(0, cursorPosition - 1);
		}

		if (event.key == 'ArrowRight') {
			cursorPosition = Math.min(equation.length, cursorPosition + 1);
		}

		if (event.key == 'Escape') {
			equation = '';
		}

		//if key isn't alphanumeric return
		if (!/^[a-zA-Z0-9+>()]$/.test(event.key)) return update();

		equation = equation.slice(0, cursorPosition) + event.key + equation.slice(cursorPosition);
		cursorPosition++;
		update();
	};

	onMount(() => {
		document.addEventListener('keydown', keydown);

		return () => {
			document.removeEventListener('keydown', keydown);
		};
	});
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center">
	<p
		on:input={update}
		class="w-1/3 rounded-xl bg-slate-700 p-3 text-center text-white ring-2 ring-slate-600 selection:outline-none"
	>
		{@html display}
	</p>

	<p class="mb-4 mt-4 text-white">Molar mass: {mass} g/mol</p>
	<div class="flex flex-row items-center justify-center gap-2">
		{#each getReactants(equation) as part, index}
			<Compound {index} {masses} {limitingReagent} {limitingReagentMoles} compound={part} />
		{/each}
		{#if getProducts(equation).length != 0}
			<div class="text-2xl text-white">→</div>
			{#each getProducts(equation) as part, index}
				<Compound index={index + getReactants(equation).length} {limitingReagent} {limitingReagentMoles} {masses} compound={part} />
			{/each}
		{/if}
	</div>
</div>

<style>
	:global(.caret) {
		display: inline-block;
		width: 0;
		border-right: 1px solid rgb(255, 255, 255);
		height: 1em;
		animation: blink 1s step-end infinite;
	}

	@keyframes blink {
		from,
		to {
			border-color: white;
		}
		50% {
			border-color: transparent;
		}
	}
</style>
