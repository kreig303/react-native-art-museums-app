import { fetchListOf } from "../../api/api";
import Fuse from "fuse.js";

// action types

export const FETCH_TARGET__SENT = "FETCH_TARGET__SENT";
export const FETCH_TARGET__FULFILLED = "FETCH_TARGET__FULFILLED";
export const FETCH_TARGET__REJECTED = "FETCH_TARGET__REJECTED";
export const SORT_LIST = "SORT_LIST";
export const RESET_LIST = "RESET_LIST";
export const FILTER_RECORDS__SENT = "FILTER_RECORDS__SENT";
export const FILTER_RECORDS__FULFILLED = "FILTER_RECORDS__FULFILLED";
export const FILTER_RECORDS__REJECTED = "FILTER_RECORDS__REJECTED";
export const FILTER_RECORDS__RESET = "FILTER_RECORDS__RESET";

// action creators

export const loadListOf = (
  target,
  url = null,
  desc = false
) => async dispatch => {
  dispatch({ type: FETCH_TARGET__SENT });
  try {
    const results = await fetchListOf(url, target, desc);
    dispatch({
      type: FETCH_TARGET__FULFILLED,
      payload: { ...results, target, desc }
    });
  } catch (err) {
    dispatch({ type: FETCH_TARGET__REJECTED, payload: err.message });
  }
};

export const sortList = state => dispatch => {
  if (state.totalRecords === state.records.length) {
    dispatch({ type: SORT_LIST });
  } else {
    const { target, desc } = state;
    dispatch({ type: RESET_LIST });
    loadListOf(target, null, !desc)(dispatch);
  }
};

export const search = (
  value = "",
  target,
  records = null
) => async dispatch => {
  if (records) {
    const options = {
      shouldSort: true,
      threshold: 0.5,
      maxPatternLength: 100,
      minMatchCharLength: 1,
      keys: ["name"]
    };
    const fuse = new Fuse(records, options);
    const result = fuse.search(value);
    if (result.length === 0) {
      dispatch({ type: FILTER_RECORDS__REJECTED, payload: "Nothing to show." });
    } else if (result.length <= 10) {
      dispatch({ type: FILTER_RECORDS__FULFILLED, payload: result });
    } else {
      dispatch({
        type: FILTER_RECORDS__REJECTED,
        payload: "Too many results, try to be more specific."
      });
    }
  } else {
    dispatch({ type: FILTER_RECORDS__SENT });
  }
};