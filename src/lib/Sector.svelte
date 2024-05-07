<script lang='ts'>
	import { getSectorPath } from './helpers';

	export let a1: number;
	export let a2: number;
	export let r1: number;
	export let r2: number;

	export let mapRadius: number;

	export let checkIfSelected: (a1: number, a2: number, r1: number, r2: number) => boolean;
	export let onSelect: (a1: number, a2: number, r1: number, r2: number) => void;

	const selected = checkIfSelected(a1, a2, r1, r2);

	const path = getSectorPath(a1, a2, r1, r2, mapRadius);

	const handleColors = (e: MouseEvent, fill: string) => {
		if (!e.target) return;
		const target = (e.target as SVGPathElement);
		target.style.fill = fill;
	}
</script>

<path
	d={path}
	stroke='rgba(255, 255, 255, 0.1)'
	stroke-width='4px'
	fill='transparent'
	paint-order='stroke'
	on:mouseover={e => handleColors(e, selected ? '#f87171' : '#b91c1c')}
	on:mouseout={e => handleColors(e, 'transparent')}
	on:focus={e => e.preventDefault()}
	on:blur={e => e.preventDefault()}
	on:click={() => onSelect(a1, a2, r1, r2)}
	aria-hidden={true}
/>

<style>
	path:focus { outline: none; }
</style>