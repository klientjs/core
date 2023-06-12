import SourceExtensions from '../extensions';
import SourceBag from '../services/bag/bag';
import SourceDispatcher from '../services/dispatcher/dispatcher';
import SourceRequestFactory from '../services/request/factory';
import SourceRequest from '../services/request/request';
import SourceEvent from '../events/event';
import SourceDebugEvent from '../events/debug';
import SourceRequestEvent from '../events/request/request';
import SourceRequestSuccessEvent from '../events/request/success';
import SourceRequestErrorEvent from '../events/request/error';
import SourceRequestCancelEvent from '../events/request/cancel';
import SourceRequestDoneEvent from '../events/request/done';

import {
  Extensions,
  Bag,
  Dispatcher,
  RequestFactory,
  Request,
  Event,
  DebugEvent,
  RequestEvent,
  RequestSuccessEvent,
  RequestErrorEvent,
  RequestCancelEvent,
  RequestDoneEvent
} from '..';

test('export', () => {
  expect(Extensions).toBe(SourceExtensions);
  expect(Bag).toBe(SourceBag);
  expect(Dispatcher).toBe(SourceDispatcher);
  expect(RequestFactory).toBe(SourceRequestFactory);
  expect(Request).toBe(SourceRequest);
  expect(Event).toBe(SourceEvent);
  expect(DebugEvent).toBe(SourceDebugEvent);
  expect(RequestEvent).toBe(SourceRequestEvent);
  expect(RequestSuccessEvent).toBe(SourceRequestSuccessEvent);
  expect(RequestErrorEvent).toBe(SourceRequestErrorEvent);
  expect(RequestCancelEvent).toBe(SourceRequestCancelEvent);
  expect(RequestDoneEvent).toBe(SourceRequestDoneEvent);
});
