"""Verify Kryptonite XR (NDC 65862020190) test drug characteristics."""


KRYPTONITE_NDC = 65862020190


def test_kryptonite_total_claims(claims_df):
    kryp = claims_df[claims_df["NDC"] == KRYPTONITE_NDC]
    assert len(kryp) == 49_567


def test_kryptonite_pct_of_dataset(claims_df):
    kryp_count = (claims_df["NDC"] == KRYPTONITE_NDC).sum()
    pct = kryp_count / len(claims_df) * 100
    assert 8.2 <= pct <= 8.4, f"Kryptonite is {pct:.2f}% of dataset"


def test_kryptonite_may_concentration(claims_df):
    """99.5% of Kryptonite claims are in May."""
    kryp = claims_df[claims_df["NDC"] == KRYPTONITE_NDC]
    may_count = len(kryp[kryp["MONTH"] == 5])
    assert may_count == 49_301
    pct = may_count / len(kryp) * 100
    assert pct > 99.0


def test_may_is_fake_without_kryptonite(real_claims_df):
    """Excluding Kryptonite, May has essentially zero claims."""
    may = real_claims_df[real_claims_df["MONTH"] == 5]
    assert len(may) == 5


def test_kryptonite_drug_info(drugs_df):
    """Kryptonite has fictional drug name and manufacturer."""
    kryp = drugs_df[drugs_df["NDC"] == KRYPTONITE_NDC]
    assert len(kryp) == 1
    row = kryp.iloc[0]
    assert row["DRUG_NAME"] == "KRYPTONITE XR"
    assert row["MANUFACTURER_NAME"] == "LEX LUTHER INC."
    assert row["MONY"] == "N"
    assert "KINGSLAYER" in row["LABEL_NAME"]


def test_kryptonite_mirrors_overall_distribution(claims_df):
    """Kryptonite state distribution mirrors the overall dataset (within 1pp)."""
    overall = claims_df["PHARMACY_STATE"].value_counts(normalize=True) * 100
    kryp = claims_df[claims_df["NDC"] == KRYPTONITE_NDC]
    kryp_dist = kryp["PHARMACY_STATE"].value_counts(normalize=True) * 100

    for state in overall.index:
        diff = abs(overall[state] - kryp_dist[state])
        assert diff < 1.0, f"{state}: overall {overall[state]:.1f}% vs kryp {kryp_dist[state]:.1f}%"


def test_kryptonite_reversal_rate_normal(claims_df):
    """Kryptonite has a normal ~10% reversal rate (not anomalous in that dimension)."""
    kryp = claims_df[claims_df["NDC"] == KRYPTONITE_NDC]
    rev_rate = (kryp["NET_CLAIM_COUNT"] == -1).sum() / len(kryp) * 100
    assert 9.5 <= rev_rate <= 11.0, f"Kryptonite reversal rate {rev_rate:.2f}%"


def test_kryptonite_only_one_ndc_from_manufacturer(drugs_df):
    """LEX LUTHER INC. has exactly 1 NDC in drug_info."""
    lex = drugs_df[drugs_df["MANUFACTURER_NAME"] == "LEX LUTHER INC."]
    assert len(lex) == 1
