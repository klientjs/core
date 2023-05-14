import SourceExtensions from '../src/extensions';
import SourceBag from '../src/services/bag';
import SourceDispatcher from '../src/services/dispatcher/dispatcher';
import SourceRequestFactory from '../src/services/request/factory';
import SourceRequest from '../src/services/request/request';
import SourceEvent from '../src/events/event';
import SourceRequestEvent from '../src/events/request/request';
import SourceRequestSuccessEvent from '../src/events/request/success';
import SourceRequestErrorEvent from '../src/events/request/error';
import SourceRequestCancelEvent from '../src/events/request/cancel';
import SourceRequestDoneEvent from '../src/events/request/done';

import {
  Extensions,
  Bag,
  Dispatcher,
  RequestFactory,
  Request,
  Event,
  RequestEvent,
  RequestSuccessEvent,
  RequestErrorEvent,
  RequestCancelEvent,
  RequestDoneEvent
} from '../src';

test('export', () => {
  expect(Extensions).toBe(SourceExtensions);
  expect(Bag).toBe(SourceBag);
  expect(Dispatcher).toBe(SourceDispatcher);
  expect(RequestFactory).toBe(SourceRequestFactory);
  expect(Request).toBe(SourceRequest);
  expect(Event).toBe(SourceEvent);
  expect(RequestEvent).toBe(SourceRequestEvent);
  expect(RequestSuccessEvent).toBe(SourceRequestSuccessEvent);
  expect(RequestErrorEvent).toBe(SourceRequestErrorEvent);
  expect(RequestCancelEvent).toBe(SourceRequestCancelEvent);
  expect(RequestDoneEvent).toBe(SourceRequestDoneEvent);
});
