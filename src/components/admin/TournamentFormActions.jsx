import { actionButtonClass } from './createTournamentStyles';

function Spinner() {
    return (
        <span
            aria-hidden="true"
            className="h-3.5 w-3.5 flex-none animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
    );
}

function TournamentFormActions({ isSaving, isPublishReady, onCancel, onSaveDraft, onPublish }) {
    return (
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-[18px] rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-3.5 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] max-[760px]:flex-col max-[760px]:items-stretch">
            <button
                className={`${actionButtonClass} border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`}
                disabled={isSaving}
                onClick={onCancel}
                type="button"
            >
                Cancel
            </button>

            <div className="flex items-center justify-end gap-3.5 max-[760px]:flex-col max-[760px]:items-stretch">
                <button
                    className={`${actionButtonClass} bg-[#fffdfc] border border-[var(--admin-primary)] text-[var(--admin-primary)] hover:bg-[#e8f7ef]`}
                    disabled={isSaving}
                    onClick={onSaveDraft}
                    type="button"
                >
                    {isSaving && <Spinner />}
                    {isSaving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                    className={`${actionButtonClass} bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-dark)]`}
                    disabled={isSaving || !isPublishReady}
                    onClick={onPublish}
                    title={!isPublishReady ? 'Fill in all required fields before publishing.' : undefined}
                    type="button"
                >
                    {isSaving && <Spinner />}
                    {isSaving ? 'Saving...' : 'Publish Tournament'}
                </button>
            </div>
        </div>
    );
}

export default TournamentFormActions;
