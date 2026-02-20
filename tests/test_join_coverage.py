"""Verify NDC join coverage between claims and drug_info."""


def test_matched_ndcs(claims_df, drugs_df):
    claims_ndcs = set(claims_df["NDC"].unique())
    drug_ndcs = set(drugs_df["NDC"].unique())
    matched = claims_ndcs & drug_ndcs
    assert len(matched) == 5_610


def test_unmatched_ndcs(claims_df, drugs_df):
    claims_ndcs = set(claims_df["NDC"].unique())
    drug_ndcs = set(drugs_df["NDC"].unique())
    unmatched = claims_ndcs - drug_ndcs
    assert len(unmatched) == 30


def test_unmatched_claim_rows(claims_df, drugs_df):
    """Only 321 claim rows (0.05%) have no drug_info match."""
    drug_ndcs = set(drugs_df["NDC"].unique())
    unmatched_rows = claims_df[~claims_df["NDC"].isin(drug_ndcs)]
    assert len(unmatched_rows) == 321


def test_match_rate(claims_df, drugs_df):
    drug_ndcs = set(drugs_df["NDC"].unique())
    matched_rows = claims_df[claims_df["NDC"].isin(drug_ndcs)]
    rate = len(matched_rows) / len(claims_df) * 100
    assert rate > 99.9


def test_drug_info_no_duplicate_ndcs(drugs_df):
    assert drugs_df["NDC"].nunique() == len(drugs_df)


def test_drug_info_row_count(drugs_df):
    assert len(drugs_df) == 246_955


def test_drug_info_no_nulls(drugs_df):
    assert drugs_df.isnull().sum().sum() == 0
