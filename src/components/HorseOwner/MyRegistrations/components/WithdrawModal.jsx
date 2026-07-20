import { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

export default function WithdrawModal({ target, onClose, onConfirm }) {
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!target) return null;

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedReason = reason.trim();

        if (trimmedReason.length < 5 || trimmedReason.length > 500) {
            setError("Withdraw reason must be between 5 and 500 characters.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            await onConfirm(target, trimmedReason);
        } catch (err) {
            setError(err.message || "Failed to withdraw registration.");
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[90] grid place-items-center bg-[rgba(27,35,51,0.45)] px-5 py-8"
            onClick={() => !submitting && onClose()}
            role="presentation"
        >
            <form
                className="grid w-[min(460px,100%)] gap-5 rounded-[14px] border border-[#ede4e2] bg-white p-7 shadow-[0_28px_70px_rgba(15,23,42,0.28)]"
                onClick={(event) => event.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-[#f3e1df] text-[#a4392f]">
                            <FaExclamationTriangle aria-hidden="true" />
                        </span>
                        <div>
                            <h2 className="m-0 text-[1.15rem] font-black text-[#1b2333]">Withdraw Registration</h2>
                            <p className="m-0 mt-1 text-sm font-semibold text-[#8a8380]">
                                {target.horseName ? target.horseName : "This registration"}
                                {target.tournamentName ? ` · ${target.tournamentName}` : ""}
                            </p>
                        </div>
                    </div>
                    <button
                        className="grid h-8 w-8 flex-none place-items-center rounded-full border border-[#ede4e2] bg-white text-[#8a8380] transition-colors hover:bg-[#faf7f5]"
                        disabled={submitting}
                        onClick={onClose}
                        type="button"
                    >
                        x
                    </button>
                </div>

                <p className="m-0 rounded-[8px] bg-[#faf7f5] px-3.5 py-2.5 text-xs font-semibold leading-relaxed text-[#6b6456]">
                    Withdrawing removes this registration from the tournament. This action cannot be undone.
                </p>

                <label className="grid gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wide text-[#6b6456]">Reason for withdrawing</span>
                    <textarea
                        autoFocus
                        className="min-h-[100px] resize-y rounded-[10px] border border-[#ded2ad] bg-[#fffdfc] px-3.5 py-3 text-sm text-[#1b2333] outline-none transition-colors focus:border-[#16305c] focus:bg-white"
                        maxLength={500}
                        minLength={5}
                        onChange={(event) => { setReason(event.target.value); setError(""); }}
                        placeholder="e.g. Horse is injured and can no longer participate"
                        required
                        value={reason}
                    />
                    <span className="text-xs font-semibold text-[#8a8380]">{reason.trim().length}/500 characters (minimum 5)</span>
                </label>

                {error && (
                    <p className="m-0 rounded-[8px] border border-[#e3bcb7] bg-[#f3e1df] px-3.5 py-2.5 text-xs font-bold text-[#a4392f]">
                        {error}
                    </p>
                )}

                <div className="flex justify-end gap-2.5 border-t border-[#f0ebe8] pt-4">
                    <button
                        className="rounded-full border border-[#ded2ad] bg-white px-5 py-2.5 text-sm font-bold text-[#5b403c] transition-colors hover:bg-[#faf7f5]"
                        disabled={submitting}
                        onClick={onClose}
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        className="rounded-full bg-[#a4392f] px-5 py-2.5 text-sm font-black text-white transition-colors hover:bg-[#8a2f27] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={submitting}
                        type="submit"
                    >
                        {submitting ? "Withdrawing..." : "Confirm Withdraw"}
                    </button>
                </div>
            </form>
        </div>
    );
}
