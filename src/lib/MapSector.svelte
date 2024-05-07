<script lang='ts'>
  import type { SectorProps } from '$lib/types';
  import { getSectorPath } from './helpers';

	export let cells: SectorProps[];
	export let mapRadius: number;

	export let showPath: (path: string) => void;
	export let pointerEvents: string = 'default';

	const path = cells.map(x =>
		getSectorPath(x.a1, x.a2, x.r1, x.r2, mapRadius)
	).join(' ') + 'Z';
	showPath(path);
</script>

<path
	d={path}
	fill='#ef4444'
	pointer-events={pointerEvents}
/>