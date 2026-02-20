"""Verify column distributions match EDA findings."""
import pytest


def test_adjudication_rate(claims_df):
    rate = claims_df["ADJUDICATED"].sum() / len(claims_df) * 100
    assert 25.0 <= rate <= 25.2, f"Adjudication rate {rate:.2f}% outside expected range"


def test_adjudication_uniform_by_state(claims_df):
    """Adjudication rate is ~25% in every state (within 0.5pp)."""
    for state, grp in claims_df.groupby("PHARMACY_STATE"):
        rate = grp["ADJUDICATED"].sum() / len(grp) * 100
        assert 24.5 <= rate <= 25.5, f"{state} adj rate {rate:.2f}% outside range"


def test_adjudication_uniform_by_formulary(claims_df):
    for form, grp in claims_df.groupby("FORMULARY"):
        rate = grp["ADJUDICATED"].sum() / len(grp) * 100
        assert 24.5 <= rate <= 25.5, f"{form} adj rate {rate:.2f}% outside range"


def test_overall_reversal_rate_real(real_claims_df):
    rev = (real_claims_df["NET_CLAIM_COUNT"] == -1).sum()
    rate = rev / len(real_claims_df) * 100
    assert 10.7 <= rate <= 10.9, f"Real reversal rate {rate:.2f}% outside expected range"


def test_reversal_rate_uniform_by_formulary(claims_df):
    """Reversal rates are within 0.2pp across formulary types."""
    rates = []
    for form, grp in claims_df.groupby("FORMULARY"):
        rate = (grp["NET_CLAIM_COUNT"] == -1).sum() / len(grp) * 100
        rates.append(rate)
    assert max(rates) - min(rates) < 0.2, f"Formulary reversal spread too wide: {rates}"


def test_state_volumes_ordered(claims_df):
    """CA > IN > PA > KS > MN by total row count."""
    counts = claims_df["PHARMACY_STATE"].value_counts()
    order = list(counts.index)
    assert order == ["CA", "IN", "PA", "KS", "MN"]


def test_formulary_volumes_ordered(claims_df):
    """OPEN > MANAGED > HMF by row count."""
    counts = claims_df["FORMULARY"].value_counts()
    order = list(counts.index)
    assert order == ["OPEN", "MANAGED", "HMF"]


def test_days_supply_top_3(claims_df):
    """Top 3 days supply values are 14, 7, 30."""
    top3 = list(claims_df["DAYS_SUPPLY"].value_counts().head(3).index)
    assert top3 == [14, 7, 30]


def test_days_supply_short_dominance(claims_df):
    """1-14 day supplies account for >70% of claims."""
    short = claims_df[claims_df["DAYS_SUPPLY"] <= 14]
    pct = len(short) / len(claims_df) * 100
    assert pct > 70, f"Short supply only {pct:.1f}%"


def test_first_of_month_cycle_fill(real_claims_df):
    """Day 1 of each real month has 6-9x the average daily volume."""
    for month in [1, 2, 3, 4, 6, 7, 8, 9, 10, 12]:  # skip May (fake), Nov (anomaly)
        month_data = real_claims_df[real_claims_df["MONTH"] == month]
        day1 = len(month_data[month_data["DATE"].dt.day == 1])
        n_days = month_data["DATE"].dt.day.nunique()
        rest_avg = (len(month_data) - day1) / (n_days - 1) if n_days > 1 else 1
        ratio = day1 / rest_avg
        assert 6.0 <= ratio <= 9.0, f"Month {month}: day-1 ratio {ratio:.1f}x outside range"
