import { Either, Left } from 'spica/either';
import { HNil } from 'spica/hlist';
import { RouterEntity } from '../model/eav/entity';
import { RouterEventLocation } from '../../event/router';
import { FetchResult } from '../model/eav/value/fetch';
import { UpdateSource } from '../model/eav/value/update';
import { SequenceData } from '../../data/config';
import { blur } from '../module/update/blur';
import { url } from '../module/update/url';
import { title } from '../module/update/title';
import { head } from '../module/update/head';
import { content, separate } from '../module/update/content';
import { css } from '../module/update/css';
import { script } from '../module/update/script';
import { focus } from '../module/update/focus';
import { scroll } from '../module/update/scroll';
import { saveTitle, savePosition } from '../../store/path';
import { DomainError } from '../../data/error';

export async function update(
  {
    event,
    config,
    state
  }: RouterEntity,
  {
    response
  }: FetchResult,
  seq: SequenceData.Fetch,
  io: {
    document: Document;
    position: () => { top: number; left: number; };
  }
): Promise<Either<Error, [HTMLScriptElement[], Promise<HTMLScriptElement[]>]>> {
  const { process } = state;
  const { documents } = new UpdateSource({
    src: response.document,
    dst: io.document
  });
  return new HNil()
    .push(process.either(seq))
    // fetch -> unload
    .modify(m => m
      .fmap(seq =>
        separate(documents, config.areas)
          .fmap(([area]) =>
            void config.rewrite(documents.src, area, ''))
          .extract<Promise<Either<Error, SequenceData.Unload>>>(
            async () =>
              Left(new DomainError(`Failed to separate areas.`)),
            async () => (
              void window.dispatchEvent(new Event('pjax:unload')),
              process.either(await config.sequence.unload(seq, response))))))
    // unload -> ready
    .modify(m => m.fmap(async p => (await p)
      .fmap(seq =>
        new HNil()
          .extend(async () => (
            void blur(documents.dst),
            void url(
              new RouterEventLocation(response.url || event.location.dest.href),
              documents.src.title,
              event.type,
              event.source,
              config.replace),
            void title(documents),
            void saveTitle(),
            void head(
              {
                src: documents.src.head,
                dst: documents.dst.head
              },
              config.update.head,
              config.update.ignore),
            content(documents, config.areas)
              .fmap<[HTMLElement[], Promise<Event[]>]>(([as, ps]) => [
                as,
                Promise.all(ps),
              ])
              .fmap(process.either)
              .extract<Either<Error, [HTMLElement[], Promise<Event[]>]>>(() =>
                Left(new DomainError(`Failed to update areas.`)))))
          .extend(async p => (await p).fmap(([areas]) => Promise.all(
            new HNil()
              .extend(async () => (
                config.update.css
                  ? void css(
                      {
                        src: documents.src.head,
                        dst: documents.dst.head
                      },
                      config.update.ignore)
                  : void 0,
                config.update.css
                  ? void css(
                      {
                        src: documents.src.body as HTMLBodyElement,
                        dst: documents.dst.body as HTMLBodyElement
                      },
                      config.update.ignore)
                  : void 0,
                void focus(documents.dst),
                void scroll(event.type, documents.dst, {
                  hash: event.location.dest.fragment,
                  position: io.position,
                }),
                void savePosition(),
                config.update.script
                  ? await script(documents, state.scripts, config.update, Math.max(config.fetch.timeout * 10, 10 * 1e3), process)
                  : await process.either<[HTMLScriptElement[], Promise<HTMLScriptElement[]>]>([[], Promise.resolve([])])))
              .extend(async () => (
                void io.document.dispatchEvent(new Event('pjax:ready')),
                process.either(await config.sequence.ready(seq, areas))))
              .reverse()
              .tuple())
            .then(([m1, m2]) =>
              m1.bind(ss =>
                m2.fmap<[[HTMLScriptElement[], Promise<HTMLScriptElement[]>], SequenceData.Ready]>(seq =>
                  [ss, seq]))))
            .extract<Either<Error, [[HTMLScriptElement[], Promise<HTMLScriptElement[]>], SequenceData.Ready]>>(Left))
          .reverse()
          .tuple())))
    // ready -> load
    .modify(m => m.fmap(async p => (await p)
      .fmap(([p1, p2]) =>
        p2.then(m2 => (
          void p1.then(m1 => m1
            .bind(([, cp]) => m2
              .fmap(async ([[, sp], seq]) => {
                await sp;
                const events = await cp;
                if (process.canceled) return;
                void window.dispatchEvent(new Event('pjax:load'));
                void config.sequence.load(seq, events);
              }))
            .extract(() => void 0)),
          m2.fmap(([[ss, p]]) => [ss, p] as [typeof ss, typeof p]))))
      .extract<Left<Error>>(Left)))
    .head
    .extract<Left<Error>>(Left);
}