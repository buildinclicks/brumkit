import { describe, it, expect, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';

import { queryKeys, invalidateQueries } from './query-keys';

describe('queryKeys', () => {
  describe('user', () => {
    it('should return the base user key', () => {
      expect(queryKeys.user.all).toEqual(['user']);
    });

    it('should return the current user key', () => {
      expect(queryKeys.user.current()).toEqual(['user', 'current']);
    });

    it('should return user by ID key', () => {
      expect(queryKeys.user.byId('u1')).toEqual(['user', 'u1']);
    });

    it('should return user profile key', () => {
      expect(queryKeys.user.profile('u1')).toEqual(['user', 'u1', 'profile']);
    });
  });

  describe('articles', () => {
    it('should return the base articles key', () => {
      expect(queryKeys.articles.all).toEqual(['articles']);
    });

    it('should return article lists key', () => {
      expect(queryKeys.articles.lists()).toEqual(['articles', 'list']);
    });

    it('should return article list with filters', () => {
      const filters = { page: 1, limit: 10 };
      const key = queryKeys.articles.list(filters);
      expect(key[0]).toBe('articles');
      expect(key[1]).toBe('list');
      expect(key[2]).toEqual(filters);
    });

    it('should return article details key', () => {
      expect(queryKeys.articles.details()).toEqual(['articles', 'detail']);
    });

    it('should return article detail key', () => {
      expect(queryKeys.articles.detail('a1')).toEqual([
        'articles',
        'detail',
        'a1',
      ]);
    });

    it('should return articles by author key', () => {
      expect(queryKeys.articles.byAuthor('u1')).toEqual([
        'articles',
        'author',
        'u1',
      ]);
    });

    it('should return articles by tag key', () => {
      expect(queryKeys.articles.byTag('react')).toEqual([
        'articles',
        'tag',
        'react',
      ]);
    });
  });

  describe('comments', () => {
    it('should return the base comments key', () => {
      expect(queryKeys.comments.all).toEqual(['comments']);
    });

    it('should return comments lists key', () => {
      expect(queryKeys.comments.lists()).toEqual(['comments', 'list']);
    });

    it('should return comments by article key', () => {
      expect(queryKeys.comments.byArticle('a1')).toEqual([
        'comments',
        'list',
        'article',
        'a1',
      ]);
    });

    it('should return comments by user key', () => {
      expect(queryKeys.comments.byUser('u1')).toEqual([
        'comments',
        'list',
        'user',
        'u1',
      ]);
    });

    it('should return comment detail key', () => {
      expect(queryKeys.comments.detail('c1')).toEqual(['comments', 'c1']);
    });
  });

  describe('tags', () => {
    it('should return the base tags key', () => {
      expect(queryKeys.tags.all).toEqual(['tags']);
    });

    it('should return tags lists key', () => {
      expect(queryKeys.tags.lists()).toEqual(['tags', 'list']);
    });

    it('should return tags list with filters', () => {
      const filters = { search: 'ts', limit: 5 };
      const key = queryKeys.tags.list(filters);
      expect(key[0]).toBe('tags');
      expect(key[1]).toBe('list');
      expect(key[2]).toEqual(filters);
    });

    it('should return popular tags key', () => {
      expect(queryKeys.tags.popular()).toEqual(['tags', 'popular']);
    });

    it('should return tag detail key', () => {
      expect(queryKeys.tags.detail('t1')).toEqual(['tags', 't1']);
    });
  });

  describe('notifications', () => {
    it('should return the base notifications key', () => {
      expect(queryKeys.notifications.all).toEqual(['notifications']);
    });

    it('should return notification lists key', () => {
      expect(queryKeys.notifications.lists()).toEqual([
        'notifications',
        'list',
      ]);
    });

    it('should return notification list with filters', () => {
      const filters = { read: false, limit: 10 };
      const key = queryKeys.notifications.list(filters);
      expect(key[0]).toBe('notifications');
      expect(key[1]).toBe('list');
    });

    it('should return unread count key', () => {
      expect(queryKeys.notifications.unreadCount()).toEqual([
        'notifications',
        'unreadCount',
      ]);
    });
  });

  describe('follows', () => {
    it('should return the base follows key', () => {
      expect(queryKeys.follows.all).toEqual(['follows']);
    });

    it('should return followers key', () => {
      expect(queryKeys.follows.followers('u1')).toEqual([
        'follows',
        'followers',
        'u1',
      ]);
    });

    it('should return following key', () => {
      expect(queryKeys.follows.following('u1')).toEqual([
        'follows',
        'following',
        'u1',
      ]);
    });

    it('should return isFollowing key', () => {
      expect(queryKeys.follows.isFollowing('u1', 'u2')).toEqual([
        'follows',
        'isFollowing',
        'u1',
        'u2',
      ]);
    });
  });

  describe('bookmarks', () => {
    it('should return the base bookmarks key', () => {
      expect(queryKeys.bookmarks.all).toEqual(['bookmarks']);
    });

    it('should return bookmarks lists key', () => {
      expect(queryKeys.bookmarks.lists()).toEqual(['bookmarks', 'list']);
    });

    it('should return bookmark list with userId and filters', () => {
      const filters = { page: 1, limit: 10 };
      const key = queryKeys.bookmarks.list('u1', filters);
      expect(key[0]).toBe('bookmarks');
      expect(key[1]).toBe('list');
      expect(key[2]).toBe('u1');
      expect(key[3]).toEqual(filters);
    });

    it('should return isBookmarked key', () => {
      expect(queryKeys.bookmarks.isBookmarked('u1', 'a1')).toEqual([
        'bookmarks',
        'isBookmarked',
        'u1',
        'a1',
      ]);
    });
  });
});

describe('invalidateQueries', () => {
  it('should invalidate user queries by id', () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, 'invalidateQueries').mockResolvedValue();

    invalidateQueries.user(qc, 'u1');

    expect(spy).toHaveBeenCalledWith({ queryKey: ['user', 'u1'] });
  });

  it('should invalidate all user queries when no id given', () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, 'invalidateQueries').mockResolvedValue();

    invalidateQueries.user(qc);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['user'] });
  });

  it('should invalidate article detail and lists when article id given', () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, 'invalidateQueries').mockResolvedValue();

    invalidateQueries.article(qc, 'a1');

    expect(spy).toHaveBeenCalledWith({
      queryKey: ['articles', 'detail', 'a1'],
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['articles', 'list'] });
  });

  it('should only invalidate lists when no article id given', () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, 'invalidateQueries').mockResolvedValue();

    invalidateQueries.article(qc);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['articles', 'list'] });
    expect(spy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: expect.arrayContaining(['detail']),
      })
    );
  });

  it('should invalidate all articles', () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, 'invalidateQueries').mockResolvedValue();

    invalidateQueries.articles(qc);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['articles'] });
  });
});
