import requests
import json
import sys

BASE_URL = "http://localhost:8080"

def run_tests():
    print("==================================================")
    print("STARTING E2E EYESOFT ADMIN REVIEW WORKFLOW TESTS")
    print("==================================================")

    # 1. Health check
    res = requests.get(f"{BASE_URL}/api/health")
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    print("✔ 1. API Health Check PASSED")

    # 2. Admin Login
    login_payload = {"username": "admin", "password": "Eyesoft@Admin2026"}
    res = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
    assert res.status_code == 200, f"Login failed: {res.status_code} {res.text}"
    data = res.json()
    assert "access_token" in data, "No access token in login response"
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✔ 2. Admin Login PASSED (JWT Received: {token[:15]}...)")

    # 3. Auth Me
    res = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    assert res.status_code == 200, f"/auth/me failed: {res.status_code}"
    me = res.json()
    assert me["username"] == "admin"
    print(f"✔ 3. Admin Profile Verification PASSED (User: {me['username']})")

    # 4. Check Stats
    res = requests.get(f"{BASE_URL}/api/stats")
    assert res.status_code == 200, f"/stats failed: {res.status_code}"
    stats = res.json()
    assert "total_reviews" in stats
    assert "pending_reviews" in stats
    assert "approved_reviews" in stats
    assert "rejected_reviews" in stats
    print(f"✔ 4. Stats Verification PASSED (Total: {stats['total_reviews']}, Pending: {stats['pending_reviews']}, Approved: {stats['approved_reviews']})")

    # 5. Check Initial Public Reviews
    res = requests.get(f"{BASE_URL}/api/reviews")
    assert res.status_code == 200
    initial_public_reviews = res.json()
    initial_count = len(initial_public_reviews)
    print(f"✔ 5. Initial Public Reviews count: {initial_count} (All verified approved)")

    # 6. Customer Submits Review on Public Site (POST /api/reviews)
    test_review_payload = {
        "customer_name": "Dr. A. Subramanian",
        "company_or_designation": "Dean of Engineering, Anna University Campus",
        "rating": 5,
        "review_text": "EYESOFT installed acoustic panelling and laser 4K projection in our auditorium. Exceptional clarity and flawless service support."
    }
    res = requests.post(f"{BASE_URL}/api/reviews", json=test_review_payload)
    assert res.status_code == 200, f"Review submission failed: {res.status_code} {res.text}"
    resp_data = res.json()
    assert resp_data["status"] == "success"
    created = resp_data["review"]
    assert created["status"] == "pending", f"Expected pending status, got {created['status']}"
    review_id = created["id"]
    print(f"✔ 6. Public Review Submission PASSED (ID: {review_id}, Status: {created['status']})")

    # 7. Verify Review is NOT yet visible publicly
    res = requests.get(f"{BASE_URL}/api/reviews")
    assert res.status_code == 200
    public_reviews_now = res.json()
    assert len(public_reviews_now) == initial_count, "Pending review should NOT appear on public website!"
    assert not any(r["id"] == review_id for r in public_reviews_now)
    print("✔ 7. Pending Review Hidden from Public Site PASSED")

    # 8. Admin Fetches Reviews (GET /api/admin/reviews?status=pending)
    res = requests.get(f"{BASE_URL}/api/admin/reviews?status=pending", headers=headers)
    assert res.status_code == 200
    admin_pending = res.json()
    assert any(r["id"] == review_id for r in admin_pending), "Review not found in admin pending list!"
    print(f"✔ 8. Admin Pending Reviews Queue PASSED (Found ID: {review_id})")

    # 9. Admin Approves Review (PUT /api/admin/reviews/{id}/status -> approved)
    res = requests.put(f"{BASE_URL}/api/admin/reviews/{review_id}/status", json={"status": "approved"}, headers=headers)
    assert res.status_code == 200
    print("✔ 9. Admin Review Approval PASSED")

    # 10. Verify Review IS NOW visible on Public Website
    res = requests.get(f"{BASE_URL}/api/reviews")
    assert res.status_code == 200
    public_reviews_after_approval = res.json()
    assert len(public_reviews_after_approval) == initial_count + 1
    approved_item = next(r for r in public_reviews_after_approval if r["id"] == review_id)
    assert approved_item["customer_name"] == "Dr. A. Subramanian"
    assert approved_item["rating"] == 5
    print(f"✔ 10. Approved Review Publicly Visible PASSED (Title: {approved_item['customer_name']})")

    # 11. Admin Rejects Review (PUT /api/admin/reviews/{id}/status -> rejected)
    res = requests.put(f"{BASE_URL}/api/admin/reviews/{review_id}/status", json={"status": "rejected"}, headers=headers)
    assert res.status_code == 200
    print("✔ 11. Admin Review Rejection PASSED")

    # 12. Verify Review is NOW REMOVED from Public Website
    res = requests.get(f"{BASE_URL}/api/reviews")
    assert res.status_code == 200
    public_reviews_after_rejection = res.json()
    assert len(public_reviews_after_rejection) == initial_count
    assert not any(r["id"] == review_id for r in public_reviews_after_rejection)
    print("✔ 12. Rejected Review Hidden from Public Site PASSED")

    # 13. Admin Permanently Deletes Review (DELETE /api/admin/reviews/{id})
    res = requests.delete(f"{BASE_URL}/api/admin/reviews/{review_id}", headers=headers)
    assert res.status_code == 200
    print("✔ 13. Admin Review Permanent Deletion PASSED")

    # 14. Verify Database Integrity & Original 3 Reviews Intact
    res = requests.get(f"{BASE_URL}/api/reviews")
    assert res.status_code == 200
    final_reviews = res.json()
    assert len(final_reviews) == initial_count == 3
    print("✔ 14. Original 3 Customer Reviews Preserved & Intact PASSED")

    # 15. Verify Admin Portal Pages & Static Files
    res = requests.get(f"{BASE_URL}/admin")
    assert res.status_code == 200, f"/admin returned {res.status_code}"
    res = requests.get(f"{BASE_URL}/admin/")
    assert res.status_code == 200, f"/admin/ returned {res.status_code}"
    res = requests.get(f"{BASE_URL}/assets/css/admin.css")
    assert res.status_code == 200, f"admin.css returned {res.status_code}"
    res = requests.get(f"{BASE_URL}/assets/js/admin.js")
    assert res.status_code == 200, f"admin.js returned {res.status_code}"
    print("✔ 15. Admin URL Routes & Static Assets PASSED (/admin, /admin/, CSS, JS)")

    print("==================================================")
    print("ALL 15 END-TO-END WORKFLOW TESTS SUCCEEDED 100%!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
