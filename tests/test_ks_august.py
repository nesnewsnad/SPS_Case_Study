"""Verify Kansas August batch reversal anomaly."""
import pytest


def test_ks_august_reversal_rate(claims_df):
    """KS August has ~81.6% reversal rate."""
    ks_aug = claims_df[(claims_df["PHARMACY_STATE"] == "KS") & (claims_df["MONTH"] == 8)]
    rev_rate = (ks_aug["NET_CLAIM_COUNT"] == -1).sum() / len(ks_aug) * 100
    assert 81.0 <= rev_rate <= 82.0, f"KS Aug reversal rate {rev_rate:.2f}%"


def test_ks_august_row_count(claims_df):
    ks_aug = claims_df[(claims_df["PHARMACY_STATE"] == "KS") & (claims_df["MONTH"] == 8)]
    assert len(ks_aug) == 6_029


def test_ks_august_net_negative(claims_df):
    """KS August has negative net claims (more reversals than incurred)."""
    ks_aug = claims_df[(claims_df["PHARMACY_STATE"] == "KS") & (claims_df["MONTH"] == 8)]
    assert ks_aug["NET_CLAIM_COUNT"].sum() == -3_813


def test_18_groups_with_100pct_reversal(claims_df):
    """Exactly 18 KS groups have 100% reversal rate in August."""
    ks_aug = claims_df[(claims_df["PHARMACY_STATE"] == "KS") & (claims_df["MONTH"] == 8)]
    grp_stats = ks_aug.groupby("GROUP_ID").agg(
        total=("NET_CLAIM_COUNT", "size"),
        reversed=("NET_CLAIM_COUNT", lambda x: (x == -1).sum()),
    )
    grp_stats["rev_rate"] = grp_stats["reversed"] / grp_stats["total"] * 100
    full_rev = grp_stats[grp_stats["rev_rate"] == 100.0]
    assert len(full_rev) == 18


def test_100pct_groups_account_for_4790_claims(claims_df):
    """The 18 fully-reversed groups account for 4,790 claims."""
    ks_aug = claims_df[(claims_df["PHARMACY_STATE"] == "KS") & (claims_df["MONTH"] == 8)]
    grp_stats = ks_aug.groupby("GROUP_ID").agg(
        total=("NET_CLAIM_COUNT", "size"),
        reversed=("NET_CLAIM_COUNT", lambda x: (x == -1).sum()),
    )
    grp_stats["rev_rate"] = grp_stats["reversed"] / grp_stats["total"] * 100
    full_rev = grp_stats[grp_stats["rev_rate"] == 100.0]
    assert full_rev["total"].sum() == 4_790


def test_100pct_groups_zero_incurred_in_august(claims_df):
    """The 18 groups have ZERO incurred claims in August."""
    ks_aug = claims_df[(claims_df["PHARMACY_STATE"] == "KS") & (claims_df["MONTH"] == 8)]
    grp_stats = ks_aug.groupby("GROUP_ID").agg(
        total=("NET_CLAIM_COUNT", "size"),
        reversed=("NET_CLAIM_COUNT", lambda x: (x == -1).sum()),
    )
    grp_stats["rev_rate"] = grp_stats["reversed"] / grp_stats["total"] * 100
    full_rev_groups = grp_stats[grp_stats["rev_rate"] == 100.0].index

    ks_aug_full = ks_aug[ks_aug["GROUP_ID"].isin(full_rev_groups)]
    incurred = (ks_aug_full["NET_CLAIM_COUNT"] == 1).sum()
    assert incurred == 0


def test_100pct_groups_are_ks_only(claims_df):
    """All 18 batch-reversal groups exist ONLY in Kansas."""
    ks_aug = claims_df[(claims_df["PHARMACY_STATE"] == "KS") & (claims_df["MONTH"] == 8)]
    grp_stats = ks_aug.groupby("GROUP_ID").agg(
        total=("NET_CLAIM_COUNT", "size"),
        reversed=("NET_CLAIM_COUNT", lambda x: (x == -1).sum()),
    )
    grp_stats["rev_rate"] = grp_stats["reversed"] / grp_stats["total"] * 100
    full_rev_groups = list(grp_stats[grp_stats["rev_rate"] == 100.0].index)

    for gid in full_rev_groups:
        states = claims_df[claims_df["GROUP_ID"] == gid]["PHARMACY_STATE"].unique()
        assert list(states) == ["KS"], f"Group {gid} in states {list(states)}"


def test_remaining_ks_august_normal_rate(claims_df):
    """Excluding 100% groups, remaining KS August reversal rate is normal (~10%)."""
    ks_aug = claims_df[(claims_df["PHARMACY_STATE"] == "KS") & (claims_df["MONTH"] == 8)]
    grp_stats = ks_aug.groupby("GROUP_ID").agg(
        total=("NET_CLAIM_COUNT", "size"),
        reversed=("NET_CLAIM_COUNT", lambda x: (x == -1).sum()),
    )
    grp_stats["rev_rate"] = grp_stats["reversed"] / grp_stats["total"] * 100
    full_rev_groups = grp_stats[grp_stats["rev_rate"] == 100.0].index

    remaining = ks_aug[~ks_aug["GROUP_ID"].isin(full_rev_groups)]
    rev_rate = (remaining["NET_CLAIM_COUNT"] == -1).sum() / len(remaining) * 100
    assert 10.0 <= rev_rate <= 11.5, f"Remaining KS Aug rate {rev_rate:.2f}%"


def test_rebill_pattern_jul_aug_sep(claims_df):
    """Top 3 batch-reversal groups show: normal Jul, 100% reversal Aug, elevated Sep."""
    top_groups = ["400127", "400132", "400130"]

    for gid in top_groups:
        grp = claims_df[(claims_df["GROUP_ID"] == gid) & (claims_df["PHARMACY_STATE"] == "KS")]

        jul = grp[grp["MONTH"] == 7]
        aug = grp[grp["MONTH"] == 8]
        sep = grp[grp["MONTH"] == 9]

        # July: normal reversal rate
        jul_rev = (jul["NET_CLAIM_COUNT"] == -1).sum() / len(jul) * 100
        assert jul_rev < 15, f"{gid} Jul rev rate {jul_rev:.1f}%"

        # August: 100% reversal
        aug_rev = (aug["NET_CLAIM_COUNT"] == -1).sum() / len(aug) * 100
        assert aug_rev == 100.0, f"{gid} Aug rev rate {aug_rev:.1f}%"

        # September: elevated volume vs July
        assert len(sep) > len(jul) * 1.3, f"{gid} Sep not elevated vs Jul"


def test_ks_normal_outside_august(claims_df):
    """KS reversal rate is ~10% in every month except August."""
    ks = claims_df[claims_df["PHARMACY_STATE"] == "KS"]
    for month in [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12]:
        m = ks[ks["MONTH"] == month]
        if len(m) == 0:
            continue
        rev_rate = (m["NET_CLAIM_COUNT"] == -1).sum() / len(m) * 100
        assert 9.0 <= rev_rate <= 11.0, f"KS month {month} rev rate {rev_rate:.2f}%"
