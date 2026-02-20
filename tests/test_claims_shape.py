"""Verify basic shape, structure, and integrity of Claims_Export.csv."""


def test_row_count(claims_df):
    assert len(claims_df) == 596_090


def test_columns(claims_df):
    """Original CSV columns are present (fixture adds DATE and MONTH)."""
    expected = {
        "ADJUDICATED", "FORMULARY", "DATE_FILLED", "NDC", "DAYS_SUPPLY",
        "GROUP_ID", "PHARMACY_STATE", "MAILRETAIL", "NET_CLAIM_COUNT",
    }
    assert expected.issubset(set(claims_df.columns))


def test_no_nulls(claims_df):
    assert claims_df.isnull().sum().sum() == 0


def test_date_range(claims_df):
    assert claims_df["DATE"].min().strftime("%Y-%m-%d") == "2021-01-01"
    assert claims_df["DATE"].max().strftime("%Y-%m-%d") == "2021-12-31"


def test_all_365_days_present(claims_df):
    assert claims_df["DATE"].nunique() == 365


def test_net_claim_count_values(claims_df):
    assert set(claims_df["NET_CLAIM_COUNT"].unique()) == {1, -1}


def test_incurred_and_reversed_counts(claims_df):
    assert (claims_df["NET_CLAIM_COUNT"] == 1).sum() == 531_988
    assert (claims_df["NET_CLAIM_COUNT"] == -1).sum() == 64_102


def test_mailretail_all_retail(claims_df):
    assert claims_df["MAILRETAIL"].nunique() == 1
    assert claims_df["MAILRETAIL"].iloc[0] == "R"


def test_unique_ndcs(claims_df):
    assert claims_df["NDC"].nunique() == 5_640


def test_unique_groups(claims_df):
    assert claims_df["GROUP_ID"].nunique() == 189


def test_pharmacy_states(claims_df):
    assert set(claims_df["PHARMACY_STATE"].unique()) == {"CA", "IN", "PA", "KS", "MN"}


def test_formulary_types(claims_df):
    assert set(claims_df["FORMULARY"].unique()) == {"OPEN", "MANAGED", "HMF"}


def test_days_supply_range(claims_df):
    assert claims_df["DAYS_SUPPLY"].min() == 1
    assert claims_df["DAYS_SUPPLY"].max() == 120
