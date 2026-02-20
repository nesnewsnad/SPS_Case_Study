"""Verify MONY distribution — both in drug_info and claims-weighted."""


def test_mony_claims_weighted_y_dominates(merged_df):
    """Single-source generic (Y) is 77% of claims."""
    y_count = (merged_df["MONY"] == "Y").sum()
    pct = y_count / len(merged_df) * 100
    assert 76 <= pct <= 78, f"MONY Y is {pct:.1f}%"


def test_mony_claims_weighted_n(merged_df):
    """Single-source brand (N) is ~21% of claims."""
    n_count = (merged_df["MONY"] == "N").sum()
    pct = n_count / len(merged_df) * 100
    assert 20 <= pct <= 22, f"MONY N is {pct:.1f}%"


def test_mony_claims_weighted_o(merged_df):
    """Multi-source generic (O) is ~1.4% of claims."""
    o_count = (merged_df["MONY"] == "O").sum()
    pct = o_count / len(merged_df) * 100
    assert 1.0 <= pct <= 2.0, f"MONY O is {pct:.1f}%"


def test_mony_claims_weighted_m(merged_df):
    """Multi-source brand (M) is ~1.0% of claims."""
    m_count = (merged_df["MONY"] == "M").sum()
    pct = m_count / len(merged_df) * 100
    assert 0.8 <= pct <= 1.2, f"MONY M is {pct:.1f}%"


def test_mony_claims_weighted_order(merged_df):
    """Claims-weighted order: Y > N > O > M."""
    counts = merged_df["MONY"].value_counts()
    # NaN (unmatched NDCs) may be present, filter to known MONY values
    mony_order = [m for m in counts.index if m in {"Y", "N", "O", "M"}]
    assert mony_order == ["Y", "N", "O", "M"], f"Order is {mony_order}"


def test_mony_drug_info_distribution(drugs_df):
    """In drug_info: Y ~60%, N ~33%, O ~6%, M <1%."""
    counts = drugs_df["MONY"].value_counts(normalize=True) * 100
    assert 59 <= counts["Y"] <= 62
    assert 32 <= counts["N"] <= 35
    assert 5 <= counts["O"] <= 7
    assert counts["M"] < 1


def test_mony_reversal_rates_uniform(merged_df):
    """Reversal rates are ~10-11% across all MONY types."""
    for mony in ["M", "O", "N", "Y"]:
        grp = merged_df[merged_df["MONY"] == mony]
        rev_rate = (grp["NET_CLAIM_COUNT"] == -1).sum() / len(grp) * 100
        assert 10.0 <= rev_rate <= 11.5, f"MONY {mony} rev rate {rev_rate:.2f}%"
