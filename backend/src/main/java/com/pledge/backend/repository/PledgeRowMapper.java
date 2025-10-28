// // java
// package com.pledge.backend.repository;
//
// import com.pledge.backend.entity.PledgeEntity;
// import org.springframework.jdbc.core.RowMapper;
//
// import java.sql.ResultSet;
// import java.sql.SQLException;
// import java.time.LocalDateTime;
//
// public class PledgeRowMapper implements RowMapper<PledgeEntity> {
//     @Override
//     public PledgeEntity mapRow(ResultSet rs, int rowNum) throws SQLException {
//         PledgeEntity e = new PledgeEntity();
//         e.setId(rs.getLong("id"));
//         e.setCustomerId(rs.getLong("customer_id"));
//         e.setTitle(rs.getString("title"));
//         e.setDescription(rs.getString("description"));
//         e.setAmount(rs.getDouble("amount"));
//         // remaining_amount may be null in older DBs; handle gracefully
//         try {
//             double rem = rs.getDouble("remaining_amount");
//             if (!rs.wasNull()) e.setRemainingAmount(rem);
//         } catch (SQLException ex) {
//             // column might not exist yet; ignore here
//         }
//         java.sql.Timestamp ts = rs.getTimestamp("deadline");
//         if (ts != null) e.setDeadline(ts.toLocalDateTime());
//         // pledge_duration might be nullable
//         try {
//             int dur = rs.getInt("pledge_duration");
//             if (!rs.wasNull()) e.setPledgeDuration(dur);
//         } catch (SQLException ex) {
//             // ignore if not present
//         }
//         // map photo columns as strings (avoid reading as long/int)
//         try {
//             String custPhoto = rs.getString("customer_photo");
//             e.setCustomerPhoto(custPhoto);
//         } catch (SQLException ex) {
//             // ignore if not present
//         }
//         try {
//             String itemPhoto = rs.getString("item_photo");
//             e.setItemPhoto(itemPhoto);
//         } catch (SQLException ex) {
//             // ignore if not present
//         }
//         try {
//             String receiptPhoto = rs.getString("receipt_photo");
//             e.setReceiptPhoto(receiptPhoto);
//         } catch (SQLException ex) {
//             // ignore if not present
//         }
//         e.setItemType(rs.getString("item_type"));
//         try { double w = rs.getDouble("weight"); if (!rs.wasNull()) e.setWeight(w); } catch (SQLException ex) {}
//         e.setPurity(rs.getString("purity"));
//         try { double ir = rs.getDouble("interest_rate"); if (!rs.wasNull()) e.setInterestRate(ir); } catch (SQLException ex) {}
//         e.setStatus(rs.getString("status"));
//         e.setNotes(rs.getString("notes"));
//         try {
//             java.sql.Timestamp lp = rs.getTimestamp("last_payment_date");
//             if (lp != null) e.setLastPaymentDate(lp.toLocalDateTime());
//         } catch (SQLException ex) {
//             // ignore
//         }
//         return e;
//     }
// }
