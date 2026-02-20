"""Verify monthly volume patterns — Sep spike, Nov dip, May exclusion.

Methodology: "normal month" baseline = 9 months excluding May (fake after
Kryptonite removal), September (the spike), and November (the dip).
This is the most analytically defensible baseline — comparing anomalies
against the months that AREN'T anomalous or artificial.
"""

ANOMALOUS_MONTHS = {5, 9, 11}  # May (fake), Sep (spike), Nov (dip)
NORMAL_MONTH_COUNT = 9


def _normal_avg(df):
    """Average monthly claims across the 9 normal months."""
    normal = df[~df["MONTH"].isin(ANOMALOUS_MONTHS)]
    return len(normal) / NORMAL_MONTH_COUNT


def test_september_spike_pct(real_claims_df):
    """September is +41% above 9-normal-month average."""
    avg = _normal_avg(real_claims_df)
    sep = real_claims_df[real_claims_df["MONTH"] == 9]
    pct_above = (len(sep) / avg - 1) * 100
    assert 40 <= pct_above <= 43, f"Sep spike is +{pct_above:.1f}%, expected ~41%"


def test_september_spike_uniform_across_states(real_claims_df):
    """All 5 states spike 38-45% in September (vs 9-normal-month avg)."""
    for state in ["CA", "IN", "PA", "KS", "MN"]:
        state_data = real_claims_df[real_claims_df["PHARMACY_STATE"] == state]
        sep = len(state_data[state_data["MONTH"] == 9])
        avg = _normal_avg(state_data)
        pct = (sep / avg - 1) * 100
        assert 38 <= pct <= 45, f"{state} Sep spike is +{pct:.1f}%"


def test_september_spike_uniform_across_formulary(real_claims_df):
    """All 3 formulary types spike 38-45% in September."""
    for form in ["OPEN", "MANAGED", "HMF"]:
        form_data = real_claims_df[real_claims_df["FORMULARY"] == form]
        sep = len(form_data[form_data["MONTH"] == 9])
        avg = _normal_avg(form_data)
        pct = (sep / avg - 1) * 100
        assert 38 <= pct <= 45, f"{form} Sep spike is +{pct:.1f}%"


def test_november_dip_pct(real_claims_df):
    """November is ~54% below 9-normal-month average."""
    avg = _normal_avg(real_claims_df)
    nov = real_claims_df[real_claims_df["MONTH"] == 11]
    pct_below = (1 - len(nov) / avg) * 100
    assert 52 <= pct_below <= 56, f"Nov dip is -{pct_below:.1f}%, expected ~54%"


def test_november_dip_uniform_across_states(real_claims_df):
    """All 5 states dip 50-60% in November."""
    for state in ["CA", "IN", "PA", "KS", "MN"]:
        state_data = real_claims_df[real_claims_df["PHARMACY_STATE"] == state]
        nov = len(state_data[state_data["MONTH"] == 11])
        avg = _normal_avg(state_data)
        pct = (1 - nov / avg) * 100
        assert 50 <= pct <= 60, f"{state} Nov dip is -{pct:.1f}%"


def test_november_all_30_days_present(real_claims_df):
    """November has claims on all 30 days."""
    nov = real_claims_df[real_claims_df["MONTH"] == 11]
    assert nov["DATE"].dt.day.nunique() == 30


def test_september_all_30_days_present(real_claims_df):
    """September has claims on all 30 days."""
    sep = real_claims_df[real_claims_df["MONTH"] == 9]
    assert sep["DATE"].dt.day.nunique() == 30


def test_real_claims_count(real_claims_df):
    assert len(real_claims_df) == 546_523
