import { useNavigate } from "react-router-dom";
import HorseOwnerLayout from "../HorseOwnerLayout";
import HorseStats from "./components/HorseStats";
import HorseTable from "./components/HorseTable";

export default function MyHorse() {
    const navigate = useNavigate();

    return (
        <HorseOwnerLayout activeKey="my-horse">
            <section className="px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="m-0 text-[1.8rem] text-[var(--admin-primary-dark)]">My Horse Directory</h2>
                        <p className="m-0 mt-1 text-[0.85rem] text-[var(--admin-muted)]">
                            Manage your horses, monitor health status, and register for tournaments.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/owner/register-horse")}
                        className="min-h-[38px] cursor-pointer rounded-[var(--admin-radius)] border-0 bg-[var(--admin-primary)] px-6 font-bold text-white hover:bg-[var(--admin-primary-dark)]"
                    >
                        + Add Horse
                    </button>
                </div>

                <HorseStats />
                <HorseTable />
            </section>
        </HorseOwnerLayout>
    );
}