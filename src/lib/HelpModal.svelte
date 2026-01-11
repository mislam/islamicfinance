<script lang="ts">
	import { CircleQuestionMark } from "@lucide/svelte"

	interface Props {
		title: string
		content: string | string[]
		modalId?: string
	}

	let {
		title,
		content,
		modalId = `help-modal-${Math.random().toString(36).substring(7)}`,
	}: Props = $props()

	let dialogElement: HTMLDialogElement | null = $state(null)

	function openModal() {
		dialogElement?.showModal()
	}
</script>

<button
	type="button"
	onclick={openModal}
	class="btn btn-circle btn-ghost btn-xs"
	aria-label="Help"
	title="Help"
>
	<CircleQuestionMark size={16} />
</button>

<dialog bind:this={dialogElement} id={modalId} class="modal">
	<div class="modal-box">
		<h3 class="text-center text-xl font-bold text-base-content">{title}</h3>
		<div class="mt-4 space-y-3 text-left text-sm font-normal">
			{#if typeof content === "string"}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<p class="text-base-content/70">{@html content}</p>
			{:else}
				{#each content as paragraph, index (index)}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<p class="text-base-content/70">{@html paragraph}</p>
				{/each}
			{/if}
		</div>
		<div class="modal-action">
			<form method="dialog">
				<button type="submit" class="btn">Close</button>
			</form>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button type="submit">close</button>
	</form>
</dialog>
