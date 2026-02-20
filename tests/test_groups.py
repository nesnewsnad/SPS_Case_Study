"""Verify GROUP_ID characteristics."""


def test_all_groups_single_state(claims_df):
    """Every GROUP_ID exists in exactly 1 state."""
    states_per_group = claims_df.groupby("GROUP_ID")["PHARMACY_STATE"].nunique()
    multi_state = states_per_group[states_per_group > 1]
    assert len(multi_state) == 0, f"Groups in multiple states: {list(multi_state.index)}"


def test_group_count(claims_df):
    assert claims_df["GROUP_ID"].nunique() == 189


def test_top_group_by_volume(claims_df):
    """6P6002 is the highest-volume group."""
    top = claims_df.groupby("GROUP_ID").size().idxmax()
    assert top == "6P6002"


def test_batch_reversal_groups_elevated_annual_rate(claims_df):
    """Groups 400127 and 400132 show elevated annual reversal (>15%) due to Aug event."""
    for gid in ["400127", "400132"]:
        grp = claims_df[claims_df["GROUP_ID"] == gid]
        rev_rate = (grp["NET_CLAIM_COUNT"] == -1).sum() / len(grp) * 100
        assert rev_rate > 15, f"{gid} annual rev rate {rev_rate:.2f}%"


def test_batch_reversal_groups_normal_excl_august(claims_df):
    """Groups 400127 and 400132 have normal ~10% rate when August is excluded."""
    for gid in ["400127", "400132"]:
        grp = claims_df[(claims_df["GROUP_ID"] == gid) & (claims_df["MONTH"] != 8)]
        rev_rate = (grp["NET_CLAIM_COUNT"] == -1).sum() / len(grp) * 100
        assert 9.0 <= rev_rate <= 11.5, f"{gid} excl-Aug rev rate {rev_rate:.2f}%"


def test_november_missing_groups_immaterial(claims_df):
    """Groups missing from November have <100 total claims (immaterial)."""
    all_groups = set(claims_df["GROUP_ID"].unique())
    nov_groups = set(claims_df[claims_df["MONTH"] == 11]["GROUP_ID"].unique())
    missing = all_groups - nov_groups
    if missing:
        missing_claims = claims_df[claims_df["GROUP_ID"].isin(missing)]
        assert len(missing_claims) < 100, f"Missing Nov groups have {len(missing_claims)} claims"
