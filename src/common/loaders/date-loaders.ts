import * as DataLoader from 'dataloader'
import { User } from 'src/modules/users/entity/user.entity'
import { Repository, In } from 'typeorm'
import { UserNotFound } from '../constant/messages.constant'
import { Images } from 'src/modules/product/entity/images.entity'

export function createUserLoader (userRepository: Repository<User>) {
  return new DataLoader<number, User>(async (userIds: number[]) => {
    const users = await userRepository.findByIds(userIds)
    const userMap = new Map(users.map(user => [user.id, user]))
    return userIds.map(id => userMap.get(id) || new Error(UserNotFound))
  })
}

export function createImageLoader (imageRepository: Repository<Images>) {
  return new DataLoader<number, Images[]>(async (productIds: number[]) => {
    const images = await imageRepository.find({
      where: { productId: In(productIds) },
      select: ['path'],
    })

    const imageMap = new Map<number, Images[]>(productIds.map(id => [id, []]))
    images.forEach(image => imageMap.get(image.productId)?.push(image))
    return productIds.map(id => imageMap.get(id) || [])
  })
}
