import { useCallback, useEffect, useState } from "react";
import HorseOwnerLayout from "../HorseOwnerLayout";
import RewardStats from "./components/RewardStats";
import AvailableRewards from "./components/AvailableRewards";
import MyHorseResults from "./components/MyHorseResults";
import { ownerApi } from "../../../api/ownerApi";
import Toast from "../../shared/Toast";
import { useToast } from "../../shared/useToast";

export default function ResultReward() {
    const [summary, setSummary] = useState(null);
    const [rewards, setRewards] = useState([]);
    const [results, setResults] = useState([]);
    const [resultsLimit, setResultsLimit] = useState(4);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loadingRewards, setLoadingRewards] = useState(true);
    const [loadingResults, setLoadingResults] = useState(true);
    const [claimingId, setClaimingId] = useState(null);
    const { toast, showToast, hideToast } = useToast();

    const loadSummary = useCallback(() => {
        setLoadingSummary(true);
        ownerApi.getRewardSummary()
            .then(setSummary)
            .catch((err) => showToast(err.message || 'Failed to load reward summary', 'error'))
            .finally(() => setLoadingSummary(false));
    }, [showToast]);

    const loadRewards = useCallback(() => {
        setLoadingRewards(true);
        ownerApi.getAvailableRewards(10)
            .then((data) => setRewards(data ?? []))
            .catch((err) => showToast(err.message || 'Failed to load rewards', 'error'))
            .finally(() => setLoadingRewards(false));
    }, [showToast]);

    const loadResults = useCallback((limit) => {
        setLoadingResults(true);
        ownerApi.getHorseResults({ limit })
            .then((data) => setResults(data ?? []))
            .catch((err) => showToast(err.message || 'Failed to load results', 'error'))
            .finally(() => setLoadingResults(false));
    }, [showToast]);

    useEffect(() => {
        loadSummary();
        loadRewards();
    }, [loadSummary, loadRewards]);

    useEffect(() => {
        loadResults(resultsLimit);
    }, [resultsLimit, loadResults]);

    const handleClaim = async (prizePayoutId) => {
        setClaimingId(prizePayoutId);
        try {
            await ownerApi.claimReward(prizePayoutId);
            loadRewards();
            loadSummary();
            showToast('Reward claimed successfully!', 'success', 'Claim Reward');
        } catch (err) {
            showToast(err.message || 'Failed to claim reward. Please try again.', 'error', 'Error');
        } finally {
            setClaimingId(null);
        }
    };

    const handleLoadMore = () => {
        setResultsLimit((prev) => prev + 5);
    };

    return (
        <HorseOwnerLayout activeKey="rewards">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <div>
                    <h2 className="m-0 text-[1.8rem] text-[var(--admin-primary-dark)]">Reward Center</h2>
                    <p className="m-0 mt-1 text-[0.85rem] text-[var(--admin-muted)]">
                        Manage and track your tournament earnings and pending claims.
                    </p>
                </div>

                <RewardStats summary={summary} loading={loadingSummary} />

                <AvailableRewards
                    rewards={rewards}
                    loading={loadingRewards}
                    onClaim={handleClaim}
                    claimingId={claimingId}
                />

                <MyHorseResults
                    results={results}
                    loading={loadingResults}
                    onLoadMore={handleLoadMore}
                    canLoadMore={results.length >= resultsLimit}
                />
            </section>

            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
                duration={3500}
            />
        </HorseOwnerLayout>
    );
}
