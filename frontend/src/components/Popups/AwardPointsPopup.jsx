import React from "react";
import styles from "./AwardPointsPopup.module.css";

export default function AwardPointsPopup({
  show,
  pointsRemain,
  awardMode,
  awardUtorid,
  awardAmount,
  awardRemark,
  setAwardMode,
  setAwardUtorid,
  setAwardAmount,
  setAwardRemark,
  insufficientPoints,
  onCancel,
  onConfirmSingle,
  onConfirmAll,
  confirmSingleOpen,
  confirmAllOpen,
  setConfirmSingleOpen,
  setConfirmAllOpen,
}) {
  if (!show) return null;
  return (
    <div className={styles.popupBackdrop}>
      <div className={styles.popupCard}>
        <button className={styles.closeButton} onClick={onCancel}>✕</button>
        <h3 className={styles.title}>Award Points</h3>
        <div className={styles.pointsRow}>Remaining Points: {pointsRemain}</div>
        <div className={styles.toggleRow}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="award-mode"
              checked={awardMode === "single"}
              onChange={() => setAwardMode("single")}
            />
            <span>Single Guest</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="award-mode"
              checked={awardMode === "all"}
              onChange={() => setAwardMode("all")}
            />
            <span>All Guests</span>
          </label>
        </div>
        {awardMode === "single" && (
          <>
            <label className={styles.label}>UtorID</label>
            <input className={styles.input} value={awardUtorid} onChange={(e) => setAwardUtorid(e.target.value)} />
          </>
        )}
        <label className={styles.label}>Amount</label>
        <input className={styles.input} value={awardAmount} onChange={(e) => setAwardAmount(e.target.value)} />
        <label className={styles.label}>Remark</label>
        <input className={styles.input} value={awardRemark} onChange={(e) => setAwardRemark(e.target.value)} />
        {insufficientPoints() && (
          <div className={styles.error}>Insufficient remaining points.</div>
        )}
        <div className={styles.actions}>
          <button
            className={styles.saveButton}
            onClick={() => {
              if (awardMode === "all") setConfirmAllOpen(true);
              else setConfirmSingleOpen(true);
            }}
            disabled={insufficientPoints() || (!awardAmount || Number(awardAmount) <= 0)}
          >
            {awardMode === "all" ? "Award To All" : "Award To Guest"}
          </button>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        </div>
      </div>

      {confirmAllOpen && (
        <div className={styles.popupBackdrop}>
          <div className={styles.popupCard}>
            <p>{`Are you sure you would like to send ${awardAmount} points to ALL guests?`}</p>
            <div className={styles.actions}>
              <button className={styles.saveButton} onClick={() => { setConfirmAllOpen(false); onConfirmAll(); }}>Confirm</button>
              <button className={styles.cancelBtn} onClick={() => setConfirmAllOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {confirmSingleOpen && (
        <div className={styles.popupBackdrop}>
          <div className={styles.popupCard}>
            <p>{`Are you sure you would like to send ${awardAmount} points to ${awardUtorid}?`}</p>
            <div className={styles.actions}>
              <button className={styles.saveButton} onClick={() => { setConfirmSingleOpen(false); onConfirmSingle(); }}>Confirm</button>
              <button className={styles.cancelBtn} onClick={() => setConfirmSingleOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
